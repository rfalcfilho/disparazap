import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import qrcode from 'qrcode-terminal';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializa o servidor Express
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Inicializa o cliente WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: join(__dirname, '.wwebjs_auth'),
    clientId: 'disparazap-client'
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox'],
    // Captura o QR code diretamente da página do WhatsApp Web
    defaultViewport: null
  }
});

// Armazena o QR code mais recente
let lastQR: string | null = null;
let qrGenerated = false;

// Eventos do cliente WhatsApp
client.on('qr', async (qr) => {
  console.log('QR Code recebido');
  lastQR = qr;
  qrGenerated = true;

  // Exibe o QR code no terminal para debug
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('Cliente WhatsApp está pronto!');
  lastQR = null;
  qrGenerated = false;
});

client.on('authenticated', () => {
  console.log('Autenticado com sucesso!');
  lastQR = null;
  qrGenerated = false;
});

client.on('auth_failure', (msg) => {
  console.error('Falha na autenticação:', msg);
  // Reinicia o processo de autenticação
  lastQR = null;
  qrGenerated = false;
  client.initialize().catch(console.error);
});

client.on('disconnected', (reason) => {
  console.log('Cliente desconectado:', reason);
  lastQR = null;
  qrGenerated = false;
  // Tenta reconectar automaticamente
  client.initialize().catch(console.error);
});

// Rotas da API
app.get('/status', (req, res) => {
  res.json({
    connected: client.pupPage ? true : false,
    qr: lastQR,
    qrGenerated: qrGenerated
  });
});

app.post('/connect', async (req, res) => {
  try {
    if (!client.pupPage) {
      await client.initialize();
      res.json({ success: true, message: 'Inicializando cliente WhatsApp' });
    } else {
      res.json({ success: true, message: 'Cliente já está inicializado' });
    }
  } catch (error) {
    console.error('Erro ao conectar:', error);
    res.status(500).json({ success: false, error: 'Erro ao inicializar cliente' });
  }
});

app.post('/disconnect', async (req, res) => {
  try {
    await client.destroy();
    lastQR = null;
    qrGenerated = false;
    res.json({ success: true, message: 'Cliente desconectado com sucesso' });
  } catch (error) {
    console.error('Erro ao desconectar:', error);
    res.status(500).json({ success: false, error: 'Erro ao desconectar cliente' });
  }
});

app.post('/send-message', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ 
      success: false, 
      error: 'Número de telefone e mensagem são obrigatórios' 
    });
  }

  try {
    // Formata o número de telefone
    const formattedPhone = phone.replace(/\D/g, '');
    
    // Verifica se o cliente está conectado
    if (!client.pupPage) {
      throw new Error('Cliente WhatsApp não está conectado');
    }

    // Envia a mensagem
    await client.sendMessage(`${formattedPhone}@c.us`, message);
    
    res.json({ success: true, message: 'Mensagem enviada com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao enviar mensagem' 
    });
  }
});

// Inicia o servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Iniciando cliente WhatsApp...');
  
  // Inicializa o cliente WhatsApp automaticamente
  client.initialize().catch(console.error);
});