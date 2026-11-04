<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Coleta e sanitização dos dados do formulário
    $name = strip_tags(trim($_POST["name"]));
    $name = str_replace(array("\r","\n"),array(" "," "),$name);
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $subject = trim($_POST["subject"]);
    $message = trim($_POST["message"]);

    // Honeypot (Anti-spam)
    if (!empty($_POST["website"])) {
        // Se o campo invisível foi preenchido, é um bot. Redireciona como se tivesse sido enviado com sucesso (para enganar o bot).
        header("Location: contact.html?status=success");
        exit;
    }

    // Validação básica
    if (empty($name) || empty($message) || empty($subject) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: contact.html?status=error");
        exit;
    }

    // Configurações do email
    $recipient = "labiofun@labiofun.com.br";
    $email_subject = "Novo contato pelo site: $subject";
    
    // Conteúdo do email
    $email_content = "Nome: $name\n";
    $email_content .= "Email: $email\n\n";
    $email_content .= "Mensagem:\n$message\n";

    // Cabeçalhos
    // No Hostinger, o cabeçalho 'From' DEVE ser um email do próprio domínio
    $email_headers = "From: labiofun@labiofun.com.br\r\n";
    $email_headers .= "Reply-To: $email\r\n";
    $email_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Envio do email
    if (mail($recipient, $email_subject, $email_content, $email_headers)) {
        header("Location: contact.html?status=success");
        exit;
    } else {
        header("Location: contact.html?status=error");
        exit;
    }
} else {
    header("Location: contact.html");
    exit;
}
?>
