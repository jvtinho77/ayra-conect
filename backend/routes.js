const express = require('express');
const router = express.Router();
const whatsappController = require('./controllers/whatsappController');

router.post('/processar', whatsappController.processarDados);
router.post('/mensagens/salvar', whatsappController.salvarMensagemRapida);
router.get('/mensagens', whatsappController.listarMensagensRapidas);
router.post('/enviar-voz', whatsappController.enviarVoz);
router.get('/leads/:phone', whatsappController.getLeadByPhone); // Nova rota CRM

module.exports = router;
