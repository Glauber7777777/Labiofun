# Labiofun

Site do Laboratório de Biofísica de Fungos (UFRJ) — https://www.labiofun.com.br

## Atualizar conteúdo

Equipe, ex-membros, colaboradores, publicações e livros ficam em `data/*.js`.
Depois de editar, gere o HTML estático (para Google e prévias de link):

```bash
npm install
npx playwright install chromium
npm run prerender
```

O script grava o conteúdo no `index.html` entre os marcadores `<!--prerender:...-->`.
Publique o `index.html` atualizado junto com os demais arquivos.
