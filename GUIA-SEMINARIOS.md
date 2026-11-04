# Como atualizar os seminários

Os seminários (página Seminários, página Defesas e o sino de notificações) podem vir de uma
**planilha do Google**. Depois de configurar, basta editar a planilha — sem upload de arquivos.

## Configuração (uma única vez)

1. Abra o Google Planilhas → **Arquivo → Importar → Upload** → envie `modelo-seminarios.csv`
   (escolha "Substituir planilha"). Ele já traz os seminários atuais.
2. **Arquivo → Compartilhar → Publicar na Web**.
   - Em "Link", escolha a aba da planilha e o formato **Valores separados por vírgula (.csv)**.
   - Clique em **Publicar** e copie o link (termina em `output=csv`).
3. Abra `js/seminars-sheet.js` e cole o link na linha:
   ```js
   const SHEET_CSV_URL = 'COLE_O_LINK_AQUI';
   ```
4. Envie `js/seminars-sheet.js` para a Hostinger (pasta `public_html/js/`).

Pronto. A partir daí, o site lê a planilha automaticamente.

## Uso no dia a dia

Adicione uma linha por seminário:

| data | apresentador | tipo | titulo | horario | local | telefone | entrada_gratuita |
|---|---|---|---|---|---|---|---|
| 25/11/2026 | Maria Silva | seminario | | | | | |
| 02/12/2026 | João Souza | mestrado | Título da dissertação | | | | |
| 10/12/2026 | Equipe Labiofun | divulgacao | Feira de Ciências | 14:00 – 18:00h | Endereço | (21) 0000-0000 | sim |

- **data**: `25/11/2026` (ou `2026-11-25`)
- **tipo**: `seminario`, `tcc`, `mestrado`, `doutorado`, `selecao` ou `divulgacao`
- **titulo**: opcional; se preenchido, aparece no card (e na página de Defesas)
- **horario, local, telefone, entrada_gratuita**: usados em eventos de `divulgacao`
- Linhas sem data ou sem apresentador são ignoradas.
- Não mude os nomes da primeira linha (cabeçalho).

As alterações aparecem no site em alguns minutos (o Google atualiza o CSV publicado
a cada ~5 min e o navegador guarda por até 10 min).

## Se algo der errado

Se a planilha estiver fora do ar, sem linhas válidas ou o link estiver vazio,
o site usa automaticamente os dados de `data/seminarios.js`.
