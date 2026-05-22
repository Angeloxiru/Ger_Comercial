#!/usr/bin/env bash
# =============================================================================
# Build de homologação — Cloudflare Pages
#
# O projeto é servido em produção (GitHub Pages) sob /Ger_Comercial/.
# Vários arquivos referenciam paths absolutos como /Ger_Comercial/index.html,
# /Ger_Comercial/js/auth.js, /Ger_Comercial/sw.js, etc.
#
# Pra não quebrar essas paths no preview, este build copia o repo inteiro
# para _site/Ger_Comercial/, fazendo a URL de preview espelhar a estrutura
# de produção:
#
#   produção  : https://angeloxiru.github.io/Ger_Comercial/index.html
#   homolog   : https://<projeto>.pages.dev/Ger_Comercial/index.html
#
# Configuração no painel Cloudflare Pages:
#   Build command       :  bash build.sh
#   Build output dir    :  _site
#   Root directory      :  /  (default)
#
# Ver docs/HOMOLOGACAO.md para o passo a passo completo.
# =============================================================================

set -euo pipefail

OUT_ROOT="_site"
OUT_DIR="${OUT_ROOT}/Ger_Comercial"

echo "▶ Limpando build anterior…"
rm -rf "$OUT_ROOT"
mkdir -p "$OUT_DIR"

echo "▶ Copiando arquivos do repo para ${OUT_DIR}/ …"
# Usa rsync se disponível (mais robusto); senão cai pra cp.
if command -v rsync >/dev/null 2>&1; then
    rsync -a \
        --exclude="${OUT_ROOT}" \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='*.bak.html' \
        --exclude='build.sh' \
        ./ "${OUT_DIR}/"
else
    # Fallback: copia tudo menos os excludes manualmente
    for item in $(ls -A); do
        case "$item" in
            "${OUT_ROOT}"|.git|node_modules|build.sh) continue ;;
            *.bak.html) continue ;;
        esac
        cp -r "$item" "${OUT_DIR}/"
    done
fi

# Raiz do domínio: redireciona quem entrar sem o subpath
cat > "${OUT_ROOT}/_redirects" <<'EOF'
# Cloudflare Pages — raiz do domínio leva ao subpath do projeto
/  /Ger_Comercial/  302
EOF

# Headers de cache — o service worker NÃO pode ser cacheado pelo CDN, senão
# atualizações de homolog ficam presas em clients antigos.
cat > "${OUT_ROOT}/_headers" <<'EOF'
/Ger_Comercial/sw.js
  Cache-Control: no-store
/Ger_Comercial/manifest.json
  Cache-Control: no-store
EOF

# Marcador discreto de que este é o ambiente de homolog (útil em debug)
cat > "${OUT_DIR}/.homologacao" <<EOF
Ambiente: HOMOLOGACAO (Cloudflare Pages)
Build:    $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Commit:   ${CF_PAGES_COMMIT_SHA:-unknown}
Branch:   ${CF_PAGES_BRANCH:-unknown}
EOF

echo "✅ Build pronto: ${OUT_DIR}/"
echo "   Arquivos: $(find "${OUT_DIR}" -type f | wc -l)"
