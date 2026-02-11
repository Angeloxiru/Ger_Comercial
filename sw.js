// Service Worker para Ger Comercial - Germani Alimentos
// Versao: 1.5.0 - Mobile improvements + file cleanup

const CACHE_NAME = 'ger-comercial-v5';
const RUNTIME_CACHE = 'ger-comercial-runtime-v5';

// Arquivos essenciais para funcionar offline
const ESSENTIAL_FILES = [
  '/Ger_Comercial/',
  '/Ger_Comercial/index.html',
  '/Ger_Comercial/login.html',
  '/Ger_Comercial/manual.html',
  '/Ger_Comercial/icon-192.png',
  '/Ger_Comercial/icon-512.png',
  '/Ger_Comercial/manifest.json',
  '/Ger_Comercial/css/mobile.css',
  '/Ger_Comercial/dashboards/dashboard-vendas-regiao.html',
  '/Ger_Comercial/dashboards/dashboard-vendas-equipe.html',
  '/Ger_Comercial/dashboards/dashboard-analise-produtos.html',
  '/Ger_Comercial/dashboards/dashboard-performance-clientes.html',
  '/Ger_Comercial/dashboards/dashboard-ranking-clientes.html',
  '/Ger_Comercial/dashboards/dashboard-clientes-semcompras.html',
  '/Ger_Comercial/dashboards/cobranca-semanal.html',
  '/Ger_Comercial/dashboards/dashboard-produtos-parados.html',
  '/Ger_Comercial/js/db.js',
  '/Ger_Comercial/js/config.js',
  '/Ger_Comercial/js/auth.js',
  '/Ger_Comercial/js/cache.js',
  '/Ger_Comercial/js/pagination.js',
  '/Ger_Comercial/js/filter-search.js',
  '/Ger_Comercial/js/dashboard-isolation.js',
  '/Ger_Comercial/js/mobile.js',
  '/Ger_Comercial/js/periodo-validator.js'
];

// Instala o Service Worker e cacheia arquivos essenciais
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando arquivos essenciais');
        // Tenta cachear todos os arquivos, mas não falha se algum não existir
        return Promise.allSettled(
          ESSENTIAL_FILES.map(url =>
            cache.add(url).catch(err => {
              console.warn(`⚠️ Não foi possível cachear ${url}:`, err);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Instalação concluída');
        return self.skipWaiting();
      })
  );
});

// Ativa o Service Worker e limpa caches antigos
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map((name) => {
              console.log(`🗑️ Service Worker: Removendo cache antigo: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Ativação concluída');
        return self.clients.claim();
      })
  );
});

// Estratégia de cache: Network First com fallback para Cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições não-HTTP
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignora requisições para APIs externas (CDN, analytics, etc)
  const externalDomains = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'unpkg.com'];
  if (externalDomains.some(domain => url.hostname.includes(domain))) {
    // Para CDNs, usa cache-first
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request)
          .then(response => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(RUNTIME_CACHE)
                .then(cache => cache.put(request, clone));
            }
            return response;
          })
        )
    );
    return;
  }

  // Para recursos do próprio app: Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Se a resposta for válida, cacheia uma cópia
        if (response && response.status === 200) {
          const clone = response.clone();

          caches.open(RUNTIME_CACHE)
            .then((cache) => {
              cache.put(request, clone);
            });
        }

        return response;
      })
      .catch(() => {
        // Se a rede falhar, tenta buscar do cache
        return caches.match(request)
          .then((cached) => {
            if (cached) {
              console.log('📦 Service Worker: Servindo do cache:', request.url);
              return cached;
            }

            // Se for uma navegação e não estiver em cache, retorna a página principal
            if (request.mode === 'navigate') {
              return caches.match('/Ger_Comercial/index.html');
            }

            // Para outros recursos, retorna erro
            return new Response('Offline - Recurso não disponível', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Limpa cache de runtime periodicamente (mantém apenas últimos 50 itens)
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'cleanCache') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE)
        .then((cache) => {
          return cache.keys()
            .then((keys) => {
              if (keys.length > 50) {
                const toDelete = keys.slice(0, keys.length - 50);
                return Promise.all(
                  toDelete.map(key => cache.delete(key))
                );
              }
            });
        })
    );
  }
});

console.log('🎉 Service Worker carregado com sucesso!');
