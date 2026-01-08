console.log("Ayra Conect: Content Script Loaded");

// --- INJECTION: Audio Interceptor (Main World) ---
function injectInterceptor() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('interceptor.js');
    (document.head || document.documentElement).appendChild(script);
    script.onload = () => script.remove();
}
injectInterceptor();

// --- LISTENER: Capture Intercepted Audio ---
let lastInterceptedBlobUrl = null;
window.addEventListener('WPP_AUDIO_INTERCEPTED', (e) => {
    if (e.detail && e.detail.src) {
        lastInterceptedBlobUrl = e.detail.src;
        // console.log("URL de áudio capturada com sucesso.");
    }
});

// Função para ajustar o layout do WhatsApp
function adjustLayout() {
    const app = document.getElementById('app');
    if (app) {
        app.style.setProperty('width', 'calc(100% - 450px)', 'important');
        app.style.setProperty('height', '100%', 'important');
        app.style.setProperty('position', 'absolute', 'important');
        app.style.setProperty('left', '0', 'important');
        app.style.setProperty('top', '0', 'important');
        app.style.setProperty('float', 'none', 'important');
    }
}

// --- INJECTION: Google Fonts for Ayra Logo ---
function injectFonts() {
    const link1 = document.createElement('link');
    link1.rel = 'preconnect';
    link1.href = 'https://fonts.googleapis.com';

    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://fonts.gstatic.com';
    link2.crossOrigin = 'anonymous';

    const link3 = document.createElement('link');
    link3.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Orbitron:wght@700&display=swap';
    link3.rel = 'stylesheet';

    document.head.appendChild(link1);
    document.head.appendChild(link2);
    document.head.appendChild(link3);
}
injectFonts();

// Função para injetar a Sidebar
function injectSidebar() {
    if (document.getElementById('wpp-sidebar')) {
        adjustLayout(); // Garante que o layout continua ajustado
        return;
    }

    adjustLayout();

    // 2. Criar a Sidebar
    const sidebar = document.createElement('div');
    sidebar.id = 'wpp-sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <div class="logo-container-ayra">
                <img src="${chrome.runtime.getURL('logo.png')}" class="logo-ayra-img" alt="Logo">
                <span class="logo-ayra-text">Ayra Conect</span>
            </div>
            <button id="wpp-theme-toggle" class="theme-toggle-btn" title="Alternar Tema">☀️</button>
        </div>
        <div class="sidebar-content">
            <!-- Seção CRM Lead Info -->
            <div id="wpp-lead-info" class="section">
                <!-- Conteúdo do Lead será injetado aqui -->
            </div>

            <!-- Seção Inteligência Artificial -->
            <div class="section">
                <h3>Inteligência Artificial</h3>
                <button id="wpp-ai-btn" class="wpp-btn premium">Chamar IA</button>
            </div>
            
            <div class="section">
                <h3>Atalhos Rápidos</h3>
                
                <!-- Container Normal dos Atalhos -->
                <div id="wpp-shortcuts-container">
                    <!-- Filtros -->
                    <div class="filter-tabs">
                        <button class="filter-btn" data-filter="text">Texto</button>
                        <button class="filter-btn" data-filter="audio">Áudio</button>
                        <button class="filter-btn active" data-filter="all">Todos</button>
                    </div>
                    <!-- Grid onde os botões serão injetados -->
                    <div id="wpp-shortcuts-grid">
                        <!-- Botões carregados via JS -->
                    </div>
                </div>

                <!-- Container Estado de Carregamento IA -->
                <div id="wpp-ai-loading">
                    <div class="ai-spinner"></div>
                </div>

                <!-- Container Sugestões IA -->
                <div id="wpp-ai-suggestions">
                    <!-- Botões de sugestão serão injetados aqui -->
                </div>

            </div>

            <!-- Seção Ações Removida -->
        </div>
    `;

    document.body.appendChild(sidebar);

    // --- LOGIC: Theme Toggle ---
    const themeBtn = document.getElementById('wpp-theme-toggle');
    const savedTheme = localStorage.getItem('ayra_theme') || 'dark';

    // Apply saved theme
    if (savedTheme === 'light') {
        sidebar.setAttribute('data-theme', 'light');
        themeBtn.innerText = '🌙';
    } else {
        themeBtn.innerText = '☀️';
    }

    themeBtn.addEventListener('click', () => {
        const current = sidebar.getAttribute('data-theme');
        if (current === 'light') {
            sidebar.removeAttribute('data-theme');
            themeBtn.innerText = '☀️';
            localStorage.setItem('ayra_theme', 'dark');
        } else {
            sidebar.setAttribute('data-theme', 'light');
            themeBtn.innerText = '🌙';
            localStorage.setItem('ayra_theme', 'light');
        }
    });

    // --- LOGICA IA: CLICK HANDLER ---
    document.getElementById('wpp-ai-btn').addEventListener('click', async () => {
        const btn = document.getElementById('wpp-ai-btn');
        const shortcutsContainer = document.getElementById('wpp-shortcuts-container');
        const aiLoading = document.getElementById('wpp-ai-loading');
        const aiSuggestions = document.getElementById('wpp-ai-suggestions');

        if (aiSuggestions.style.display === 'flex') {
            aiSuggestions.style.display = 'none';
            shortcutsContainer.style.display = 'block';
            btn.innerText = 'Chamar IA';
            return;
        }

        if (!currentLeadData) {
            alert('Abra uma conversa com um Lead cadastrado primeiro!');
            return;
        }

        // 1. Esconder Atalhos, Mostrar Loading
        shortcutsContainer.style.display = 'none';
        aiLoading.style.display = 'block';
        aiSuggestions.style.display = 'none';
        btn.disabled = true;
        btn.innerText = 'Processando...';

        try {
            // 2. Chamar Webhook
            const webhookUrl = 'https://n8n.blackmaind.shop/webhook/b4f5-b7a9e9dd6d64';
            const payload = {
                leadName: currentLeadData.Nome,
                niche: currentLeadData.stat || currentLeadData.Nicho,
                city: currentLeadData.Cidade,
                phone: currentLeadPhone,
                timestamp: new Date().toISOString()
            };

            const res = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`Erro API: ${res.status}`);

            // 3. Receber Resposta (Array de Strings)
            const suggestions = await res.json();

            console.log("[IA Webhook] Resposta bruta:", suggestions);

            let finalSuggestions = [];

            // Validação de formatos possíveis
            if (Array.isArray(suggestions)) {
                // Caso 1: Array direto ["msg1", "msg2"]
                finalSuggestions = suggestions;
            } else if (suggestions.messages && Array.isArray(suggestions.messages)) {
                // Caso 2: Objeto wrapper { messages: ["msg1"] } (Padrão n8n visto)
                finalSuggestions = suggestions.messages;
            } else if (suggestions.output && suggestions.output.messages && Array.isArray(suggestions.output.messages)) {
                // Caso 3: Wrapper n8n complexo { output: { messages: [] } }
                finalSuggestions = suggestions.output.messages;
            } else if (suggestions.message) {
                // Caso 4: Mensagem única { message: "msg" }
                finalSuggestions = [suggestions.message];
            } else {
                throw new Error("Formato de resposta inválido. Esperado array ou { messages: [] }");
            }

            // 4. Renderizar Sugestões (COM MESMO ESTILO DOS ATALHOS)
            aiLoading.style.display = 'none';
            aiSuggestions.style.display = 'flex';
            aiSuggestions.innerHTML = '';

            // Re-habilita o botão para servir de "Voltar"
            btn.disabled = false;
            btn.innerText = 'Voltar aos Atalhos';

            // Grid de Sugestões (Usando mesmo grid dos atalhos para manter layout)
            const suggestionsGrid = document.createElement('div');
            suggestionsGrid.id = 'wpp-shortcuts-grid'; // Reusa o ID de estilo do grid
            suggestionsGrid.style.display = 'flex'; // Força display flex
            aiSuggestions.appendChild(suggestionsGrid);

            // Botões de Mensagem (Reusando classes .wpp-btn .shortcut)
            finalSuggestions.forEach(msg => {
                const msgBtn = document.createElement('button');
                msgBtn.className = 'wpp-btn shortcut'; // Mesma classe dos atalhos normais!
                msgBtn.innerText = msg;
                msgBtn.title = 'Enviar agora';

                // Estilo inline para garantir visibilidade se houver conflito
                msgBtn.style.width = 'calc(50% - 6px)';
                msgBtn.style.color = 'var(--text-white)'; // Garante texto branco/claro
                msgBtn.style.justifyContent = 'flex-start';
                msgBtn.style.textAlign = 'left';

                msgBtn.onclick = () => {
                    sendTextToInput(msg);
                };
                suggestionsGrid.appendChild(msgBtn);
            });

        } catch (error) {
            console.error("Erro IA:", error);
            alert("Erro ao gerar sugestões: " + error.message);
            // Restaurar estado original em erro
            aiLoading.style.display = 'none';
            shortcutsContainer.style.display = 'block';
            btn.innerText = 'Chamar IA';
            btn.disabled = false;
        }
    });


    // Carregar Atalhos Dinâmicos
    loadShortcuts(); // Carrega 'all' por padrão

    // Configurar Filtros
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active de todos
            filterBtns.forEach(b => b.classList.remove('active'));
            // Adiciona no clicado
            btn.classList.add('active');

            // Recarrega grid com filtro
            const filter = btn.dataset.filter;
            loadShortcuts(filter);
        });
    });

    // Iniciar detector de hover para mensagens
    initHoverObserver();
}

// Função para carregar atalhos do backend
// Agora aceita um argumento 'filterType' (all, text, audio)
// Cache simples para não buscar no backend toda hora ao filtrar
let cachedShortcuts = [];
let currentLeadPhone = ""; // Rastrear o telefone atual para evitar requests duplicados

// --- CRM LEAD INFO LOGIC ---
let currentLeadData = null; // Armazena dados do lead atual para uso no Webhook

// Função Auxiliar para Inserir/Enviar Texto (Disponível globalmente)
function sendTextToInput(text, autoSend = false) {
    // Seletores comuns do WhatsApp Web para o campo de texto
    const input = document.querySelector('footer div[contenteditable="true"]') ||
        document.querySelector('div[title="Digite uma mensagem"]') ||
        document.querySelector('._ak1l div[contenteditable="true"]');

    if (input) {
        input.focus();

        // Tenta usar execCommand para inserção natural (preserva histórico)
        const success = document.execCommand('insertText', false, text);

        // Fallback se execCommand falhar
        if (!success) {
            console.log("[WPP Sidebar] execCommand falhou, usando fallback innerText");
            // Se houver texto, adiciona ao final, senão substitui
            if (input.innerText.length > 0) {
                input.innerText += text;
            } else {
                input.innerText = text;
            }
        }

        // Importante: Disparar evento de input para o React/Lexical do WhatsApp notar a mudança
        input.dispatchEvent(new Event('input', { bubbles: true }));

        if (autoSend) {
            setTimeout(() => {
                const enterEvent = new KeyboardEvent('keydown', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    keyCode: 13,
                    which: 13,
                    code: 'Enter',
                    key: 'Enter'
                });
                input.dispatchEvent(enterEvent);
            }, 150);
        }
    } else {
        alert("Campo de texto não encontrado. Por favor, abra uma conversa.");
    }
}

// Função para pegar o título do chat atual
function getChatTitle() {
    const titleEl = document.querySelector('#main header span[title]') ||
        document.querySelector('header span[title]');
    return titleEl ? titleEl.title || titleEl.innerText : "Desconhecido";
}

async function updateLeadInfo() {
    // ... (rest of function)
    // O header da sidebar é o primeiro. O da conversa costuma estar dentro de #main ou é o segundo.
    const headerElement = document.querySelector('#main header');

    if (!headerElement) {
        // Tenta fallback genérico se #main mudar de ID (WPP muda as vezes)
        // Pega todos e assume que o da direita (largura maior) é o da conversa
        const headers = document.querySelectorAll('header');
        if (headers.length > 1) {
            // Geralmente o ultimo header é o da conversa 
            // (Sidebar header -> Status drawer header -> Chat header)
            return processHeader(headers[headers.length - 1]);
        }

        console.log("[CRM Debug] Header da conversa não encontrado.");
        return;
    }

    processHeader(headerElement);
}

async function processHeader(headerElement) {

    let phoneParam = "";

    // ESTRATÉGIA 1: React Fiber (Mantida pois é a mais robusta se funcionar)
    if (!phoneParam) {
        try {
            const keys = Object.keys(headerElement);
            const reactKey = keys.find(key => key.startsWith('__reactFiber') || key.startsWith('__reactInternal'));
            if (reactKey) {
                let fiber = headerElement[reactKey];
                let attempts = 0;
                while (fiber && attempts < 50) {
                    const p = fiber.memoizedProps;
                    if (p) {
                        const dataObj = p.chat || p.contact || p.data;
                        if (dataObj && dataObj.id && typeof dataObj.id === 'object' && dataObj.id._serialized) {
                            phoneParam = dataObj.id._serialized.replace(/\D/g, '');
                            console.log("[CRM Debug] Sucesso via React Fiber:", phoneParam);
                            break;
                        }
                    }
                    fiber = fiber.return;
                    attempts++;
                }
            }
        } catch (e) {
            console.error("Erro no React Traversal:", e);
        }
    }

    // ESTRATÉGIA 2 (Solicitada pelo User): Varrer spans do Header
    // O usuário mostrou que o número está num <span dir="auto">...</span>
    if (!phoneParam || phoneParam.length < 10) {
        // Pega todos os spans dentro do header
        const spans = headerElement.querySelectorAll('span');

        for (let span of spans) {
            const text = span.innerText || "";
            // Regex rigorosa para telefone formato BR: +55 17 ... ou 5517...
            // Deve ter pelo menos 10 digitos
            const cleanParams = text.replace(/\D/g, '');

            if (cleanParams.length >= 10 && (text.includes('+') || text.includes('-') || /\d/.test(text))) {
                // Verifica se parece um telefone (começa com 55 ou tem DDD)
                // Assumindo que o user está no Brasil, a maioria começará com 55.
                // Mas vamos aceitar qualquer sequencia longa de numeros que estava visivel.

                // Evitar pegar "visto por ultimo as 10:10" (que tem digitos mas não é phone)
                // O texto do número geralmente é curto (< 25 chars) e composto majoritariamente de números/sinais.
                if (text.length < 25 && /[0-9]/.test(text)) {
                    phoneParam = cleanParams;
                    console.log("[CRM Debug] Sucesso via Varredura de Span:", phoneParam, "| Texto original:", text);
                    break;
                }
            }
        }
    }

    // ESTRATÉGIA 3: Texto Bruto (Fallback final)
    if (!phoneParam || phoneParam.length < 10) {
        const headerText = headerElement.innerText || "";
        const match = headerText.match(/(\+?55|)\s?\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/);
        if (match) {
            phoneParam = match[0].replace(/\D/g, '');
            console.log("[CRM Debug] Sucesso via Regex Bruta no Header:", phoneParam);
        }
    }


    // LOG FINAL
    if (phoneParam && phoneParam.length >= 10) {
        console.log("✅ CRM TARGET CONFIRMADO: ", phoneParam);
    } else {
        console.log("❌ CRM TARGET NÃO ENCONTRADO. Header Text:", headerElement.innerText);
    }

    // Busca o Lead
    if (phoneParam !== currentLeadPhone && phoneParam.length >= 10) {
        currentLeadPhone = phoneParam;

        const container = document.getElementById('wpp-lead-info');
        if (!container) return; // Sidebar fechada ou não carregada

        try {
            // Pequeno loader visual
            container.innerHTML = `
                <div style="padding: 10px; text-align: center; color: var(--text-muted); font-size: 12px;">
                    <span class="loading-pulse"></span> Buscando Lead...
                </div>`;

            const res = await fetch(`http://localhost:3000/leads/${currentLeadPhone}`);
            const result = await res.json();

            if (result.success && result.data) {
                const lead = result.data;
                currentLeadData = lead; // Persiste dados para o Webhook da IA

                const nome = lead.Nome || 'Sem Nome';
                const inicial = nome.trim().charAt(0).toUpperCase();
                const nicho = lead.stat || lead.Nicho || 'Sem Nicho';
                const cidade = lead.Cidade || 'Não informada';
                const site = (lead.Site && lead.Site !== 'null' && lead.Site.length > 3) ? (lead.Site.startsWith('http') ? lead.Site : 'http://' + lead.Site) : null;

                // Renderizar Card do Lead Premium
                container.innerHTML = `
                    <div class="lead-card premium-glass">
                        <div class="lead-header-row">
                            <div class="lead-avatar-container">
                                <div class="lead-initial-avatar">${inicial}</div>
                            </div>
                            <div class="lead-info-col">
                                <h4 class="lead-name" title="${nome}">${nome}</h4>
                                <div class="lead-tags-row">
                                    <span class="lead-tag niche">${nicho}</span>
                                    <span class="lead-tag city">📍 ${cidade}</span>
                                </div>
                            </div>
                            ${site ? `
                            <div class="lead-actions-col">
                                <a href="${site}" target="_blank" class="lead-action-btn" title="Acessar Site">
                                    🌐
                                </a>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = `<div class="lead-empty">Lead não encontrado no CRM.</div>`;
            }
        } catch (e) {
            console.error("Erro CRM:", e);
            container.innerHTML = `<div class="lead-error">Erro ao buscar lead.</div>`;
        }
    }
}


async function loadShortcuts(filterType = 'all') {
    const grid = document.getElementById('wpp-shortcuts-grid');
    if (!grid) return;

    try {
        // Se já temos cache e estamos apenas filtrando, não busca no server
        // Mas se for a primeira vez (cachedShortcuts vazio), busca.
        if (cachedShortcuts.length === 0) {
            const res = await fetch('http://localhost:3000/mensagens');
            const result = await res.json();
            if (result.success) {
                cachedShortcuts = result.data;
            }
        }

        if (cachedShortcuts.length > 0) {
            let items = [...cachedShortcuts];

            // 1. Filtragem
            if (filterType === 'audio') {
                items = items.filter(i => i.type === 'audio' || i.Audio);
            } else if (filterType === 'text') {
                items = items.filter(i => !i.Audio && i.type !== 'audio');
            }

            // 2. Aplicar ordenação salva no LocalStorage (se existir)
            const savedOrder = JSON.parse(localStorage.getItem('ayra_shorcuts_order') || '[]');
            if (savedOrder.length > 0) {
                const orderMap = new Map(savedOrder.map((id, index) => [id, index]));
                items.sort((a, b) => {
                    const indexA = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
                    const indexB = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
                    return indexA - indexB;
                });
            }

            grid.innerHTML = '';

            items.forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'wpp-btn shortcut';
                // Priorizar o Nome, se não tiver mostrar começo da mensagem
                btn.innerText = item.Nome || item.message.substring(0, 15) + '...';
                btn.title = item.message;

                // DRAG AND DROP ATTRIBUTES
                btn.setAttribute('draggable', 'true');
                btn.dataset.id = item.id;

                // Click Action
                btn.addEventListener('click', async () => {
                    // Lógica diferenciada para Áudio e Texto
                    if (item.type === 'audio' || item.Audio) {
                        try {
                            const n8nWebhookUrl = 'https://n8n.blackmaind.shop/webhook/651ad2d1-cb0d-458d-b653-c56eadf24a04';
                            const payload = {
                                leadData: currentLeadData || { Nome: 'Desconhecido' },
                                contactWhatsApp: getChatTitle(),
                                audioContent: item.Audio,
                                shortcutName: item.Nome || 'Áudio Sem Nome',
                                timestamp: new Date().toISOString()
                            };

                            console.log("[Audio Webhook] Enviando para n8n:", payload.shortcutName);

                            const res = await fetch(n8nWebhookUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            });

                            if (!res.ok) throw new Error(`Status: ${res.status}`);

                            // Visual feedback (opcional: mudar texto do botão brevemente)
                            const originalText = btn.innerText;
                            btn.innerText = '✅ Enviado!';
                            setTimeout(() => btn.innerText = originalText, 2000);

                        } catch (e) {
                            console.error("Erro ao disparar webhook de áudio:", e);
                            alert("Falha ao processar áudio via Webhook.");
                        }
                    } else {
                        // Texto: Apenas insere (autoSend = false por padrão)
                        sendTextToInput(item.message);
                    }
                });
                grid.appendChild(btn);
            });
        }
    } catch (e) { console.error('Erro ao carregar atalhos:', e); }
}

// Função para observar o hover nas mensagens
function initHoverObserver() {
    document.addEventListener('mouseover', (e) => {
        // Encontra o container da mensagem (a linha inteira)
        const msgRow = e.target.closest('.message-in, .message-out');
        if (msgRow) {
            // Tenta encontrar o "bubble" (balão da mensagem) 
            const bubble = msgRow.querySelector('._amk6') ||
                msgRow.querySelector('.copyable-text')?.parentElement ||
                msgRow.querySelector('audio')?.closest('div') ||
                msgRow.querySelector('div[role="row"] > div');

            if (bubble && !bubble.querySelector('.wpp-save-hover-btn')) {
                showHoverButton(bubble);
            }
        }
    });
}

function showHoverButton(bubble) {
    // Remover botões de outros bubbles para evitar duplicatas e poluição
    document.querySelectorAll('.wpp-save-hover-btn').forEach(b => b.remove());

    const btn = document.createElement('div');
    btn.className = 'wpp-save-hover-btn';
    btn.innerText = '+';
    btn.title = 'Salvar como Atalho';

    btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("Botão de salvar clicado! (Método React)");

        try {
            // 1. Tentar pegar texto
            const textEl = bubble.querySelector('.copyable-text span') || bubble.querySelector('span[dir="ltr"]');
            const text = textEl ? textEl.innerText : "";

            // 2. Tentar pegar áudio via React Props (Muito mais robusto)
            let audioBase64 = null;
            const msgRow = bubble.closest('.message-in, .message-out');

            if (msgRow) {
                // 1. Tentar URL interceptada (INFALÍVEL)
                // Se o usuário clicou em play recentemente, já temos a URL.
                // Se não, vamos forçar o play abaixo e a URL vai chegar.

                // Força o play para garantir que o interceptor pegue (mesmo se já tocou antes)
                // Força o play para garantir que o interceptor pegue
                const playBtn = msgRow.querySelector('button[aria-label="Reproduzir mensagem de voz"]') ||
                    msgRow.querySelector('button[aria-label="Reproduzir"]') ||
                    msgRow.querySelector('button[aria-label="Play"]') ||
                    msgRow.querySelector('span[data-icon="audio-play"]')?.closest('button');

                if (playBtn) {
                    // Reseta para garantir que é o áudio certo
                    lastInterceptedBlobUrl = null;

                    // Play rápido
                    const wasPlaying = playBtn.getAttribute('aria-label') === "Pausar mensagem de voz";
                    if (!wasPlaying) {
                        playBtn.click();
                        // Espera interceptor disparar
                        await new Promise(r => setTimeout(r, 1200));
                        playBtn.click(); // Pause
                    } else {
                        // Se já está tocando, a URL já deve ter sido interceptada recentemente
                        // Mas por garantia, pausa e play de novo? 
                        // Melhor não interromper o usuário. Vamos confiar que o evento já rolou.
                    }
                }

                if (lastInterceptedBlobUrl) {
                    console.log("Usando URL interceptada pelo espião:", lastInterceptedBlobUrl);
                    try {
                        const res = await fetch(lastInterceptedBlobUrl);
                        const blob = await res.blob();
                        audioBase64 = await blobToBase64(blob);
                    } catch (err) { console.error("Erro fetch intercept:", err); }
                }

                // 2. Se falhar (não deveria), tenta o scanner antigo como fallback
                if (!audioBase64) {
                    const context = scanForAudioContext(msgRow);
                    if (context && context.blobUrl) {
                        try {
                            const res = await fetch(context.blobUrl);
                            const blob = await res.blob();
                            audioBase64 = await blobToBase64(blob);
                        } catch (e) { }
                    }
                }
            }

            // Verifica se capturou algo
            if (audioBase64) {
                console.log("[Ayra Conect] Áudio capturado.");
            } else if (text) {
                console.log("[Ayra Conect] Texto capturado.");
            } else {
                console.log("[Ayra Conect] Buscando mídia...");
            }

            // Remove modal anterior e força abertura
            const existingModal = document.getElementById('wpp-naming-modal');
            if (existingModal) existingModal.remove();
            const existingOverlay = document.getElementById('wpp-modal-overlay');
            if (existingOverlay) existingOverlay.remove();

            if (text || audioBase64) {
                openNamingModal(text, audioBase64);
            } else {
                // Se falhar tudo, tenta mais uma vez buscar o áudio globalmente antes de desistir
                // (Último recurso: o play pode ter demorado)
                setTimeout(async () => {
                    const audios = document.querySelectorAll('audio');
                    for (let audio of audios) {
                        if (audio.src && audio.src.startsWith('blob:')) {
                            try {
                                const res = await fetch(audio.src);
                                const blob = await res.blob();
                                const delayedAudio = await blobToBase64(blob);
                                if (delayedAudio) {
                                    openNamingModal("", delayedAudio);
                                    return;
                                }
                            } catch (e) { }
                        }
                    }
                    // Se ainda assim nada, avisa
                    alert("Não foi possível capturar o áudio. Tente dar play nele manualmente antes de clicar em salvar.");
                }, 1000); // Dá um segundo extra
            }

        } catch (fatalError) {
            console.error("Erro fatal no clique:", fatalError);
            alert("Erro interno: " + fatalError.message);
        }
    });

    // Garante que o bubble é o contexto de posicionamento
    if (window.getComputedStyle(bubble).position === 'static') {
        bubble.style.position = 'relative';
    }

    bubble.appendChild(btn);
}

// Helpers para explorar o React
function getReactProps(el) {
    if (!el) return null;
    const keys = Object.keys(el);
    const propKey = keys.find(k => k.startsWith('__reactProps') || k.startsWith('__reactFiber'));
    return propKey ? el[propKey] : null;
}

// Função SCANNER GENÉRICO (Busca por tipo ou blob, ignorando nomes de chaves)
function scanForAudioContext(msgRow) {
    if (!msgRow) return null;

    console.log("--- Iniciando Scanner Genérico de Áudio ---");

    // Otimização: incluir canvas (onde o áudio desenha a onde)
    const descendants = msgRow.querySelectorAll('div, span, button, canvas');

    // Lista de candidatos para analizar (inclui a própria row)
    const elementsToCheck = [msgRow, ...descendants];

    for (let el of elementsToCheck) {
        const props = getReactProps(el);
        if (props) {
            // Busca profunda por qualquer sinal de áudio
            const found = deepSearchForAudio(props);
            if (found) {
                console.log("Contexto de áudio encontrado!", found);
                return found; // Retorna { msgObj: ..., blobUrl: ... }
            }
        }
    }

    console.log("[Ayra Conect] Scanner de mídia finalizado.");
    return null;
}

function deepSearchForAudio(obj, depth = 0, visited = new WeakSet()) {
    if (depth > 8 || !obj || typeof obj !== 'object') return null;
    if (visited.has(obj)) return null;
    visited.add(obj);

    // 1. Verificar se é um objeto de mensagem de áudio válido
    // Normalmente tem type='audio' ou 'ptt' e tem mediaData
    if (obj.type === 'audio' || obj.type === 'ptt') {
        if (obj.mediaData || obj.mediaObject) {
            return { msgObj: obj, blobUrl: null };
        }
    }

    // 2. Verificar se contém uma URL de blob direta (muito valioso!)
    if (obj.renderableUrl && typeof obj.renderableUrl === 'string' && obj.renderableUrl.startsWith('blob:')) {
        return { msgObj: obj, blobUrl: obj.renderableUrl };
    }

    // Busca recursiva nas chaves
    const keys = Object.keys(obj);
    for (const key of keys) {
        // Ignorar chaves cíclicas ou gigantes que não importam
        if (key === 'return' || key === 'stateNode' || key.startsWith('_')) continue;

        const val = obj[key];

        // Se acharmos uma string blob solta, pode ser útil
        if (typeof val === 'string' && val.startsWith('blob:') && val.includes('audio')) {
            return { msgObj: null, blobUrl: val };
        }

        if (val && typeof val === 'object') {
            const res = deepSearchForAudio(val, depth + 1, visited);
            if (res) return res;
        }
    }

    return null;
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function openNamingModal(message, audioBase64) {
    if (document.getElementById('wpp-naming-modal')) return;

    const isAudio = !!audioBase64;
    const overlay = document.createElement('div');
    overlay.id = 'wpp-modal-overlay';

    const modal = document.createElement('div');
    modal.id = 'wpp-naming-modal';
    modal.innerHTML = `
        <h3>Salvar Novo Atalho (${isAudio ? 'Áudio' : 'Texto'})</h3>
        <p id="modal-subtitle">${isAudio ? 'A mensagem contém um arquivo de áudio.' : `Texto: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`}</p>
        <input type="text" id="wpp-shortcut-name" placeholder="Nome do atalho (ex: Boas Vindas)" autofocus>
        <div class="modal-actions">
            <button id="wpp-modal-cancel" class="wpp-btn" style="border: none;">Cancelar</button>
            <button id="wpp-modal-save" class="wpp-btn main">Salvar</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    document.getElementById('wpp-modal-cancel').onclick = () => {
        modal.remove();
        overlay.remove();
    };

    document.getElementById('wpp-modal-save').onclick = async (e) => {
        const btn = e.target;
        const originalText = btn.innerText;
        const nome = document.getElementById('wpp-shortcut-name').value;

        if (!nome) return alert('Dê um nome ao atalho!');

        try {
            btn.innerText = 'Salvando...';
            btn.disabled = true;

            const res = await fetch('http://localhost:3000/mensagens/salvar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: isAudio ? 'audio' : 'text',
                    message: message || '',
                    audioBase64: audioBase64 || null,
                    nome: nome
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Erro no servidor');
            }

            const data = await res.json();
            if (data.success) {
                alert('Atalho salvo com sucesso!');
                modal.remove();
                overlay.remove();
                loadShortcuts();
            } else {
                alert('Erro ao salvar: ' + data.message);
            }
        } catch (e) {
            console.error('Erro ao salvar:', e);
            alert('Erro: ' + e.message);
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    };
}

// Helper: Pega o nome do contato aberto
function getChatTitle() {
    const titleEl = document.querySelector('header span[title]');
    return titleEl ? titleEl.innerText : "Contato Desconhecido";
}

// --- Robust Drag and Drop Logic (Swap Strategy) ---
let dragSrcEl = null;

function addDragEvents(btn, gridContainer) {
    btn.addEventListener('dragstart', (e) => {
        dragSrcEl = btn;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', btn.innerHTML);
        btn.classList.add('dragging');
    });

    btn.addEventListener('dragover', (e) => {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    });

    btn.addEventListener('dragenter', (e) => {
        // Se estamos arrastando sobre um outro botão, trocar de lugar visualmente
        if (dragSrcEl !== btn) {
            // A mágica: troca o DOM de lugar dinamicamente
            // Isso dá o feedback visual instantâneo que o usuário quer

            // Pega a lista de filhos pra saber a ordem
            const children = Array.from(gridContainer.children);
            const srcIndex = children.indexOf(dragSrcEl);
            const targetIndex = children.indexOf(btn);

            if (srcIndex < targetIndex) {
                // Se arrastando pra frente, insere depois do alvo
                gridContainer.insertBefore(dragSrcEl, btn.nextSibling);
            } else {
                // Se arrastando pra trás, insere antes do alvo
                gridContainer.insertBefore(dragSrcEl, btn);
            }
        }
    });

    btn.addEventListener('dragend', () => {
        btn.classList.remove('dragging');
        dragSrcEl = null;
        saveNewOrder(gridContainer);
    });
}

// getDragAfterElement não é mais necessário com essa estratégia direta de swap
function saveNewOrder(container) {
    const newOrder = [...container.querySelectorAll('.wpp-btn.shortcut')].map(btn => parseInt(btn.dataset.id));
    localStorage.setItem('ayra_shorcuts_order', JSON.stringify(newOrder));
    console.log("Nova ordem salva:", newOrder);
}

// Função para capturar dados da conversa
async function handleProcessClick() {
    console.log("Botão clicado! Coletando dados...");

    // Tentar pegar o nome do contato selecionado
    const contactNameElement = document.querySelector('header span[title]');
    const contactName = contactNameElement ? contactNameElement.innerText : "Desconhecido";

    // Tentar pegar o texto digitado na caixa de mensagem
    const inputField = document.querySelector('footer div[contenteditable="true"]');
    const typedText = inputField ? inputField.innerText : "";

    // Tentar pegar as últimas mensagens (seletor aproximado do WPP Web)
    const messages = Array.from(document.querySelectorAll('.message-in, .message-out')).slice(-5).map(el => {
        const textEl = el.querySelector('.copyable-text span');
        return textEl ? textEl.innerText : "";
    }).filter(t => t !== "");

    const data = {
        contact: contactName,
        text: typedText,
        recentMessages: messages,
        timestamp: new Date().toISOString()
    };

    console.log("Dados coletados:", data);

    try {
        const response = await fetch('http://localhost:3000/processar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        alert("Resposta do Backend: " + JSON.stringify(result));
    } catch (error) {
        console.error("Erro ao enviar para o backend:", error);
        alert("Erro ao conectar com o backend. Verifique se ele está rodando em localhost:3000");
    }
}

// Esperar o WhatsApp carregar (pode precisar de ajustes dependendo da velocidade)
const observer = new MutationObserver((mutations) => {
    const mainApp = document.getElementById('app');
    if (mainApp) {
        injectSidebar();
        // Verificar mudanças de chat constantement (simples polling via observer)
        updateLeadInfo();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
