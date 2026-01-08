const { getClient } = require('../wpp');
const supabase = require('../supabase');

const processarDados = async (req, res) => {
    const { contact, text, recentMessages, timestamp } = req.body;

    console.log('--- Novo Dado Recebido da Extensão ---');
    console.log(`Contato: ${contact}`);
    console.log(`Texto Digitado: ${text}`);
    console.log(`Mensagens Recentes: ${recentMessages.join(' | ')}`);
    console.log(`Timestamp: ${timestamp}`);
    console.log('--------------------------------------');

    const client = getClient();

    if (!client) {
        return res.status(503).json({
            success: false,
            message: 'WhatsApp Client não inicializado. Verifique o QR Code no terminal.'
        });
    }

    try {
        res.json({
            success: true,
            message: `Dados de ${contact} processados com sucesso pelo backend!`
        });
    } catch (error) {
        console.error('Erro ao processar dados:', error);
        res.status(500).json({ success: false, message: 'Erro interno no backend.' });
    }
};

const salvarMensagemRapida = async (req, res) => {
    const { type, message, audioBase64, nome } = req.body;
    console.log(`[Backend] Tentando salvar atalho: ${nome} (${type})`);

    try {
        const payload = {
            type: type,
            message: message,
            Audio: audioBase64 || null,
            Nome: nome || null
        };

        console.log('[Backend] Payload para Supabase:', payload);

        const { data, error } = await supabase
            .from('Menssagem_Rapida')
            .insert([payload])
            .select();

        if (error) {
            console.error('[Backend] Erro detectado no Supabase:', error);
            throw error;
        }

        console.log('[Backend] Sucesso ao salvar:', data);
        res.json({ success: true, message: 'Salvo no Supabase com sucesso!', data: data });
    } catch (error) {
        console.error('[Backend] Erro fatal no controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erro interno no servidor',
            details: error
        });
    }
};

const listarMensagensRapidas = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Menssagem_Rapida')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ success: true, data: data });
    } catch (error) {
        console.error('Erro Supabase ao listar:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const enviarVoz = async (req, res) => {
    const { contactName, audioBase64 } = req.body;
    console.log(`[Backend] Tentando enviar áudio para: ${contactName}`);

    const client = getClient();
    if (!client) {
        return res.status(503).json({ success: false, message: 'WhatsApp Client não inicializado.' });
    }

    try {
        // Buscar o chat pelo nome
        const chats = await client.listChats();
        const chat = chats.find(c =>
            c.name === contactName ||
            (c.contact && (c.contact.name === contactName || c.contact.pushname === contactName))
        );

        if (!chat) {
            console.error(`[Backend] Chat não encontrado para o nome: ${contactName}`);
            return res.status(404).json({ success: false, message: 'Contato não encontrado no WhatsApp.' });
        }

        // Enviar como PTT (Audio de Voz)
        // O WPPConnect espera o base64 com o prefixo data:audio/ogg;base64,... ou similar
        await client.sendPttFromBase64(chat.id._serialized || chat.id, audioBase64, 'audio.ogg');

        console.log(`[Backend] Áudio enviado com sucesso para ${contactName}`);
        res.json({ success: true, message: 'Áudio enviado com sucesso!' });
    } catch (error) {
        console.error('[Backend] Erro ao enviar áudio:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getLeadByPhone = async (req, res) => {
    const { phone } = req.params;
    // Sanitizar: remove tudo que não for número
    const sanitizedPhone = phone.replace(/\D/g, '');

    console.log(`[Backend CRM] Buscando lead para telefone: ${sanitizedPhone}`);

    try {
        // Busca na tabela exata Leads_Apex_prospecçao
        // Compara com a coluna Numero
        const { data, error } = await supabase
            .from('Leads_Apex_prospecçao')
            .select('*')
            .eq('Numero', sanitizedPhone)
            .single(); // Espera apenas um ou null

        if (error && error.code !== 'PGRST116') { // PGRST116 é "No rows found" para .single()
            throw error;
        }

        if (!data) {
            console.log('[Backend CRM] Lead não encontrado.');
            return res.json({ success: false, message: 'Lead não encontrado' });
        }

        console.log('[Backend CRM] Lead encontrado:', data.Nome);
        res.json({ success: true, data: data });

    } catch (error) {
        console.error('[Backend CRM] Erro ao buscar lead:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    processarDados,
    salvarMensagemRapida,
    listarMensagensRapidas,
    enviarVoz,
    getLeadByPhone
};
