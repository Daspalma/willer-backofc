const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

const USUARIOS_PATH = path.join(__dirname, 'usuarios.json');

function carregarUsuarios() {
  if (!fs.existsSync(USUARIOS_PATH)) {
    const inicial = [
      { nome: 'Admin', email: 'admin@banco.com', senha: '1234' }
    ];
    fs.writeFileSync(USUARIOS_PATH, JSON.stringify(inicial, null, 2), 'utf-8');
    console.log('📄 usuarios.json criado com usuário padrão.');
  }
  const raw = fs.readFileSync(USUARIOS_PATH, 'utf-8');
  return JSON.parse(raw);
}

function salvarUsuarios(usuarios) {
  fs.writeFileSync(USUARIOS_PATH, JSON.stringify(usuarios, null, 2), 'utf-8');
}

// Permite requisições do frontend (localhost:5500, 127.0.0.1:5500, file://, etc.)
app.use(cors({
  origin: '*',
}));
app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ mensagem: '✅ API do Banco rodando!' });
});

app.get('/api/usuarios', (req, res) => {
  const usuarios = carregarUsuarios();
  const semSenha = usuarios.map(({ nome, email }) => ({ nome, email }));
  res.json(semSenha);
});

app.post('/api/register', (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }

  if (senha.length < 4) {
    return res.status(400).json({ erro: 'A senha deve ter no mínimo 4 caracteres.' });
  }

  const usuarios = carregarUsuarios();

  const jaExiste = usuarios.find((u) => u.email === email);
  if (jaExiste) {
    return res.status(409).json({ erro: 'E-mail já cadastrado.' });
  }

  usuarios.push({ nome, email, senha });
  salvarUsuarios(usuarios);

  console.log('✅ Novo usuário:', email, '| Total:', usuarios.length);
  return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
});

app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }

  const usuarios = carregarUsuarios();
  const usuario = usuarios.find((u) => u.email === email && u.senha === senha);

  if (!usuario) {
    return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
  }

  console.log('🔓 Login:', email);
  return res.status(200).json({
    mensagem: 'Login realizado com sucesso!',
    usuario: { nome: usuario.nome, email: usuario.email },
  });
});

app.listen(PORT, () => {
  console.log(`✅ Back-end rodando em http://localhost:${PORT}`);
  console.log(`📁 Dados em: ${USUARIOS_PATH}`);
});
