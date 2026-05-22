# Homologação — Cloudflare Pages

> Como ter um ambiente de teste isolado da `main` sem atrapalhar a equipe
> comercial que usa a produção.

---

## 1. O que é (e o que não é)

| Produção (GitHub Pages) | Homologação (Cloudflare Pages) |
|---|---|
| Branch: `main` | Qualquer branch (especialmente PRs abertos) |
| URL: `https://angeloxiru.github.io/Ger_Comercial/…` | URL: `https://ger-comercial.pages.dev/Ger_Comercial/…` (e uma URL única por branch) |
| Quem usa: equipe comercial | Quem usa: você, para validar mudanças antes do merge |
| Banco: Turso (mesmo) | Banco: Turso (mesmo) ⚠ |

> ⚠ **Cuidado:** homologação aponta para o **mesmo banco** da produção. Para
> leitura (dashboards) isso é seguro; para escrita (alterar senha, criar
> usuário, importar vendas) o efeito é real. Evite testar fluxos de escrita
> em homologação ou faça-os com dados descartáveis.

---

## 2. Setup inicial (faz uma vez, ~5 minutos)

### 2.1 Criar conta na Cloudflare
1. Acesse <https://dash.cloudflare.com/sign-up>
2. Cadastro grátis (sem cartão).
3. Confirme o e-mail.

### 2.2 Conectar o repositório
1. Painel CF → **Workers & Pages** → **Create** → aba **Pages** → **Connect to Git**.
2. Autorize o app **Cloudflare Pages** na sua conta GitHub.
3. Selecione o repositório `Angeloxiru/Ger_Comercial`.

### 2.3 Configurar o build
Use **exatamente** estes valores:

| Campo | Valor |
|---|---|
| Project name | `ger-comercial` (vira parte da URL) |
| Production branch | `main` |
| Framework preset | **None** |
| Build command | `bash build.sh` |
| Build output directory | `_site` |
| Root directory (advanced) | *(deixe em branco)* |

Clique **Save and Deploy**. O primeiro build leva ~30 s.

### 2.4 Verificar
- Acesse `https://ger-comercial.pages.dev/Ger_Comercial/`.
- O redirect de `/` para `/Ger_Comercial/` já está configurado pelo `_redirects`.
- A tela de login deve abrir igual à produção.

---

## 3. Fluxo de trabalho — por branch / por PR

Depois do setup, **toda branch que você empurrar** gera um preview automático:

```
push origin claude/qualquer-coisa
       │
       ▼
Cloudflare detecta → roda build.sh → publica
       │
       ▼
https://claude-qualquer-coisa.ger-comercial.pages.dev/Ger_Comercial/
```

Cada PR também ganha um comentário automático no GitHub com a URL do preview.

### Onde achar a URL

- **Painel CF Pages** → projeto `ger-comercial` → aba **Deployments**.
- Comentário automático do bot `cloudflare-pages` no PR do GitHub.
- A URL canônica de uma branch é:
  `https://<branch-slug>.ger-comercial.pages.dev/Ger_Comercial/`
  onde `<branch-slug>` é o nome da branch com `/` substituído por `-`.

### Como validar uma mudança antes de merger

1. Crie/atualize a branch (`git push origin <branch>`).
2. Aguarde ~30 s o build do CF (vê no painel ou no PR).
3. Abre a URL de preview, faz o roteiro de teste:
   - Login funciona?
   - Dashboards alterados abrem sem erro no console?
   - Filtros aplicam? Tabela renderiza? Gráficos aparecem?
   - Badge "atualizado há X" aparece após carga? (FASE 1+)
   - Exportações Excel/PDF funcionam?
4. Se passar → merger no `main` → produção atualiza automaticamente.

---

## 4. Build localmente (sem CF)

Antes de empurrar, dá pra simular o build na sua máquina:

```bash
bash build.sh
cd _site
python3 -m http.server 8000
# abre http://localhost:8000/Ger_Comercial/
```

Mesma estrutura do CF. Útil pra iteração rápida.

---

## 5. Limites do plano grátis CF Pages

- 500 builds/mês — sobra mesmo com vários PRs por dia.
- Bandwidth ilimitado.
- Quantos PRs abertos quiser, cada um com sua URL.
- Logs de build retidos por 7 dias.

---

## 6. O que está no repo (referência)

| Arquivo | Função |
|---|---|
| `build.sh` | Empacota o repo em `_site/Ger_Comercial/`, gera `_redirects` e `_headers` |
| `docs/HOMOLOGACAO.md` | Este documento |
| `.gitignore` | `_site/` já está ignorado |

`build.sh` é **idempotente** — limpa `_site/` antes de cada execução.

---

## 7. Troubleshooting

### Preview "404 not found"
Acesse com o subpath: `…pages.dev/Ger_Comercial/` (com a barra no fim).
A raiz nua redireciona, mas só funciona com o `_redirects` aplicado — o que
acontece apenas no CF, não em build local.

### Login não autentica
A homologação usa o mesmo banco da produção. Se autentica em produção,
autentica aqui. Limpe `localStorage` se sessão antiga estiver atrapalhando.

### Service worker preso em versão antiga
1. DevTools → Application → Service Workers → **Unregister**.
2. Recarregue.
O `_headers` força `no-store` no `sw.js`, então a próxima atualização chega
imediatamente — esse problema ocorre só com SWs já instalados antes da
config de cache.

### Build falha no CF
Verifique no painel **Deployments → último deploy → View build log**.
Causa comum: alguém adicionou um arquivo enorme que ultrapassa o limite
de 25 MB por arquivo. Solução: mover pra fora do repo ou ignorar no `build.sh`.
