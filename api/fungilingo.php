<?php
/**
 * Fungilingo API: quiz com pontuação calculada no servidor e ranking.
 *
 *   POST ?action=start   {name, token}         : nova rodada (10 perguntas, sem gabarito) para o apelido
 *   POST ?action=answer  {sid, i, choice}       : corrige a pergunta i
 *   POST ?action=submit  {sid}                  : grava a pontuação da rodada no ranking
 *   GET  ?action=leaderboard&period=all|week    : lista os 20 primeiros colocados
 *
 * Dados gravados em api/fungilingo-data/ (acesso direto bloqueado por .htaccess).
 */
declare(strict_types=1);
define('FUNGILINGO', true);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const QUESTIONS_PER_ROUND = 10;
const SESSION_TTL = 1800;          // 30 min para terminar a rodada
const BASE_POINTS = 100;           // por acerto
const MAX_SPEED_BONUS = 50;        // bônus por rapidez (até 50 por pergunta)
const SPEED_WINDOW = 20.0;         // segundos: responder em <=2 s dá bônus máximo, >=20 s dá zero
const MIN_ANSWER_SECONDS = 1.0;    // respostas mais rápidas que isso não ganham bônus (anti-robô)
const MAX_STARTS_PER_HOUR = 30;    // por IP
const LEADERBOARD_KEEP = 500;

$DATA = __DIR__ . '/fungilingo-data';
$SESS = $DATA . '/sessions';
foreach ([$DATA, $SESS] as $d) { if (!is_dir($d)) @mkdir($d, 0755, true); }
if (!file_exists("$DATA/.htaccess")) @file_put_contents("$DATA/.htaccess", "Require all denied\nDeny from all\n");

function out($data, int $code = 200): void { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $msg, int $code = 400): void { out(['ok' => false, 'error' => $msg], $code); }
function body(): array { $b = json_decode(file_get_contents('php://input') ?: '[]', true); return is_array($b) ? $b : []; }
function valid_sid($s): bool { return is_string($s) && preg_match('/^[a-f0-9]{32}$/', $s) === 1; }
function clean_name($n): string { return trim(preg_replace('/\s+/u', ' ', (string)$n)); }
function valid_name(string $n): bool { return preg_match('/^[\p{L}\p{N} ._\-]{2,20}$/u', $n) === 1; }

/** Lê-modifica-grava um JSON com trava exclusiva. */
function with_json(string $file, callable $fn) {
    $fh = fopen($file, 'c+');
    if (!$fh) fail('Armazenamento indisponível', 500);
    flock($fh, LOCK_EX);
    $raw = stream_get_contents($fh);
    $data = $raw ? (json_decode($raw, true) ?: []) : [];
    [$data, $ret] = $fn($data);
    ftruncate($fh, 0); rewind($fh);
    fwrite($fh, json_encode($data, JSON_UNESCAPED_UNICODE));
    fflush($fh); flock($fh, LOCK_UN); fclose($fh);
    return $ret;
}

/** Monta o banco: perguntas dos artigos + perguntas geradas do glossário. */
function question_bank(): array {
    $bank = [];
    foreach (require __DIR__ . '/fungilingo-questions.php' as $q) { $q['src'] = 'artigo'; $bank[] = $q; }
    $g = json_decode((string)@file_get_contents(__DIR__ . '/../data/fungilingo-glossary.json'), true) ?: [];
    foreach ($g as $idx => $term) {
        // mesmo tema primeiro, depois quaisquer outros, para os distratores
        $same = array_values(array_filter($g, fn($x) => $x['c'] === $term['c'] && $x['t'] !== $term['t']));
        $others = array_values(array_filter($g, fn($x) => $x['c'] !== $term['c']));
        $bank[] = ['gi' => $idx, 'src' => 'glossario', 'same' => array_column($same, 't'), 'others' => array_column($others, 't'),
                   't' => $term['t'], 'd' => $term['d'], 'c' => $term['c']];
    }
    return $bank;
}

function build_round(): array {
    $bank = question_bank();
    $articles = array_values(array_filter($bank, fn($q) => $q['src'] === 'artigo'));
    $gloss = array_values(array_filter($bank, fn($q) => $q['src'] === 'glossario'));
    shuffle($articles); shuffle($gloss);
    $picked = array_merge(array_slice($articles, 0, 5), array_slice($gloss, 0, QUESTIONS_PER_ROUND - 5));
    shuffle($picked);

    $round = [];
    foreach ($picked as $q) {
        if ($q['src'] === 'artigo') {
            $opts = $q['o']; $correct = $opts[$q['a']];
            shuffle($opts);
            $round[] = ['q' => $q['q'], 'o' => $opts, 'a' => array_search($correct, $opts, true),
                        'e' => $q['e'], 'ref' => !empty($q['doi']) ? 'https://doi.org/' . $q['doi'] : null,
                        'tipo' => !empty($q['doi']) ? 'Artigo do Labiofun' : 'Micologia'];
        } else {
            $pool = $q['same']; shuffle($pool);
            $dist = array_slice($pool, 0, 3);
            if (count($dist) < 3) { $o = $q['others']; shuffle($o); $dist = array_merge($dist, array_slice($o, 0, 3 - count($dist))); }
            $opts = array_merge([$q['t']], $dist); shuffle($opts);
            $round[] = ['q' => 'Qual termo corresponde a esta definição? “' . $q['d'] . '”', 'o' => $opts,
                        'a' => array_search($q['t'], $opts, true), 'e' => $q['t'] . ': ' . $q['d'], 'ref' => null, 'tipo' => 'Glossário · ' . $q['c']];
        }
    }
    return $round;
}

/** Melhor resultado de cada apelido (lista já ordenada). */
function best_per_player(array $lb): array {
    $seen = []; $out = [];
    foreach ($lb as $e) { $k = mb_strtolower($e['name']); if (isset($seen[$k])) continue; $seen[$k] = true; $out[] = $e; }
    return $out;
}

function client_ip_hash(): string { return hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|fungilingo'); }

function cleanup_sessions(string $dir): void {
    if (mt_rand(1, 20) !== 1) return;
    foreach (glob("$dir/*.json") ?: [] as $f) { if (filemtime($f) < time() - 2 * SESSION_TTL) @unlink($f); }
}

function load_session(string $dir, string $sid): array {
    $f = "$dir/$sid.json";
    if (!file_exists($f)) fail('Rodada não encontrada ou expirada', 404);
    $s = json_decode((string)file_get_contents($f), true);
    if (!$s || time() - $s['created'] > SESSION_TTL) fail('Rodada expirada', 410);
    return $s;
}

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($action) {

case 'start':
    if ($method !== 'POST') fail('Use POST', 405);
    $b = body();
    $name = clean_name($b['name'] ?? ''); $token = $b['token'] ?? '';
    if (!valid_name($name)) fail('Apelido: 2 a 20 letras, números, espaço, ponto, hífen ou _');
    if (!valid_sid($token)) fail('Identificação inválida. Recarregue a página.');
    // Apelido pertence a quem o registrou primeiro (chave secreta guardada no navegador)
    $owner = with_json("$DATA/players.json", function ($pl) use ($name, $token) {
        $k = mb_strtolower($name); $h = hash('sha256', $token);
        if (isset($pl[$k]) && !hash_equals($pl[$k]['h'], $h)) return [$pl, false];
        $pl[$k] = ['name' => $name, 'h' => $h, 'ts' => $pl[$k]['ts'] ?? time()];
        return [$pl, true];
    });
    if (!$owner) fail('Este apelido já pertence a outro jogador. Escolha outro.', 409);
    cleanup_sessions($SESS);
    $ip = client_ip_hash(); $hour = (string)intdiv(time(), 3600);
    $allowed = with_json("$DATA/ratelimit.json", function ($d) use ($ip, $hour) {
        $d = array_filter($d, fn($v, $k) => str_starts_with($k, "$hour:"), ARRAY_FILTER_USE_BOTH);
        $k = "$hour:$ip"; $d[$k] = ($d[$k] ?? 0) + 1;
        return [$d, $d[$k] <= MAX_STARTS_PER_HOUR];
    });
    if (!$allowed) fail('Muitas rodadas nesta hora. Tente mais tarde.', 429);

    $sid = bin2hex(random_bytes(16));
    $round = build_round();
    $now = microtime(true);
    file_put_contents("$SESS/$sid.json", json_encode([
        'created' => time(), 'last' => $now, 'round' => $round, 'answers' => [], 'score' => 0, 'submitted' => false, 'name' => $name,
    ], JSON_UNESCAPED_UNICODE), LOCK_EX);
    out(['ok' => true, 'sid' => $sid, 'total' => count($round),
         'questions' => array_map(fn($q) => ['q' => $q['q'], 'o' => $q['o'], 'tipo' => $q['tipo']], $round)]);

case 'answer':
    if ($method !== 'POST') fail('Use POST', 405);
    $b = body(); $sid = $b['sid'] ?? ''; $i = $b['i'] ?? -1; $choice = $b['choice'] ?? -1;
    if (!valid_sid($sid) || !is_int($i) || !is_int($choice)) fail('Dados inválidos');
    if (!file_exists("$SESS/$sid.json")) fail('Rodada não encontrada ou expirada', 404);
    $res = with_json("$SESS/$sid.json", function ($s) use ($i, $choice) {
        if (!$s || time() - ($s['created'] ?? 0) > SESSION_TTL) return [$s, ['err' => 'Rodada expirada']];
        if ($i !== count($s['answers']) || !isset($s['round'][$i])) return [$s, ['err' => 'Responda as perguntas em ordem']];
        $q = $s['round'][$i]; $now = microtime(true);
        $secs = $now - $s['last'];
        $correct = ($choice === $q['a']);
        $bonus = 0;
        if ($correct && $secs >= MIN_ANSWER_SECONDS) {
            $bonus = (int)round(MAX_SPEED_BONUS * max(0, min(1, (SPEED_WINDOW - $secs) / (SPEED_WINDOW - 2))));
        }
        $pts = $correct ? BASE_POINTS + $bonus : 0;
        $s['answers'][] = ['c' => $choice, 'ok' => $correct, 'pts' => $pts, 'secs' => round($secs, 1)];
        $s['score'] += $pts; $s['last'] = $now;
        return [$s, ['ok' => true, 'correct' => $correct, 'answer' => $q['a'], 'points' => $pts, 'bonus' => $bonus,
                     'score' => $s['score'], 'explanation' => $q['e'], 'ref' => $q['ref'],
                     'done' => count($s['answers']) >= count($s['round'])]];
    });
    if (isset($res['err'])) fail($res['err'], 409);
    out($res);

case 'submit':
    if ($method !== 'POST') fail('Use POST', 405);
    $b = body(); $sid = $b['sid'] ?? '';
    if (!valid_sid($sid)) fail('Dados inválidos');
    if (!file_exists("$SESS/$sid.json")) fail('Rodada não encontrada ou expirada', 404);
    $entry = with_json("$SESS/$sid.json", function ($s) {
        if (!$s || ($s['submitted'] ?? false) || empty($s['name'])) return [$s, null];
        if (count($s['answers']) < count($s['round'])) return [$s, null];
        $s['submitted'] = true;
        return [$s, ['name' => $s['name'], 'score' => $s['score'], 'correct' => count(array_filter($s['answers'], fn($a) => $a['ok'])),
                     'total' => count($s['round']), 'secs' => round(array_sum(array_column($s['answers'], 'secs')), 1)]];
    });
    if (!$entry) fail('Rodada incompleta ou já enviada', 409);
    $entry += ['ts' => time(), 'id' => substr($sid, 0, 8)];
    $rank = with_json("$DATA/leaderboard.json", function ($lb) use ($entry) {
        $lb[] = $entry;
        usort($lb, fn($a, $b) => [$b['score'], $a['secs'], $a['ts']] <=> [$a['score'], $b['secs'], $b['ts']]);
        $lb = array_slice($lb, 0, LEADERBOARD_KEEP);
        $best = best_per_player($lb);
        $pos = array_search(mb_strtolower($entry['name']), array_map(fn($e) => mb_strtolower($e['name']), $best), true);
        $isBest = $pos !== false && $best[$pos]['id'] === $entry['id'];
        return [$lb, ['rank' => $pos === false ? null : $pos + 1, 'best' => $pos === false ? null : $best[$pos]['score'], 'isBest' => $isBest, 'players' => count($best)]];
    });
    out(['ok' => true, 'rank' => $rank['rank'], 'best' => $rank['best'], 'isBest' => $rank['isBest'], 'players' => $rank['players'], 'entry' => $entry]);

case 'leaderboard':
    $period = ($_GET['period'] ?? 'all') === 'week' ? 'week' : 'all';
    $lb = json_decode((string)@file_get_contents("$DATA/leaderboard.json"), true) ?: [];
    if ($period === 'week') { $since = time() - 7 * 86400; $lb = array_values(array_filter($lb, fn($e) => $e['ts'] >= $since)); }
    $lb = best_per_player($lb);
    out(['ok' => true, 'period' => $period, 'players' => count($lb),
         'top' => array_map(fn($e) => ['name' => $e['name'], 'score' => $e['score'], 'correct' => $e['correct'],
                                       'total' => $e['total'], 'secs' => $e['secs'], 'ts' => $e['ts']], array_slice($lb, 0, 20))]);

default:
    fail('Ação desconhecida', 404);
}
