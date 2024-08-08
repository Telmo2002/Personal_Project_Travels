var express = require('express');
var router = express.Router();
var env = require('../config/env');
var axios = require('axios');
var jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar o multer para salvar as imagens na pasta 'public/images/users'
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'public', 'images', 'users');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.userID.trim() + ext); // Usa o username para nomear o arquivo
  }
});


const upload = multer({ storage: storage });

// Função para formatar a data
function formatDate(dateString) {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-PT', options).format(date).replace(',', ' às') + 'h';
}

// Middleware para verificar o token JWT
function verifyToken(req, res, next) {
  const token = req.cookies.token || req.headers['x-access-token'];

  if (token) {
    jwt.verify(token, 'telmo2002', (err, decoded) => {
      if (err) {
        console.error('Erro ao verificar token:', err);
        return res.status(403).render('error', { error: 'Token inválido ou expirado.' });
      }
      req.userID = decoded.username;
      console.log('User do Token decodificado:', req.userID);
      next();
    });
  } else {
    console.error('Nenhum token fornecido.');
    res.status(403).render('error', { error: 'Token não fornecido.' });
  }
}

// Função para verificar se o usuário é o proprietário da viagem
function verifyOwnership(req, res, next) {
  const viagemId = req.params.id;

  axios.get(`${env.apiAccessPoint}/getviagens/${viagemId}`)
    .then(response => {
      const viagem = response.data;

      // Verificar se o usuário autenticado é o proprietário da viagem
      if (viagem.userID !== req.userID) {
        console.error('Acesso não autorizado: O utilizador não é o proprietário da viagem.');
        return res.status(403).render('error', { error: 'Acesso não autorizado: você não é o proprietário desta viagem.' });
      }

      next();
    })
    .catch(err => {
      console.error('Erro ao verificar propriedade da viagem:', err.response ? err.response.data : err.message);
      res.render('error', { error: err.message });
    });
}

// GET home page
router.get('/', verifyToken, function(req, res) {
  axios.get(`${env.apiAccessPoint}/getviagens/inicial/${req.userID}`)
    .then(response => {
      console.log('Dados de viagens recebidos:', response.data);
      res.render('index', {
        viagens: response.data,
      });
    })
    .catch(err => {
      console.error('Erro ao buscar viagens:', err.response ? err.response.data : err.message);
      res.render('error', { error: err.message });
    });
});

// GET detalhes da viagem
router.get('/viagem/:id', verifyToken, verifyOwnership, function(req, res) {
  var viagemId = req.params.id;

  axios.get(`${env.apiAccessPoint}/getviagens/${viagemId}`)
    .then(response => {
      var viagem = response.data;

      // Calcular total gasto em cartão e dinheiro
      var totalGastosCartao = viagem.gastos
        .filter(gasto => gasto.metodoPag === 'cartao')
        .reduce((acc, gasto) => acc + gasto.amount, 0);

      var totalGastosDinheiro = viagem.gastos
        .filter(gasto => gasto.metodoPag === 'dinheiro')
        .reduce((acc, gasto) => acc + gasto.amount, 0);

      var quantiaDisponivel = viagem.amount - (totalGastosCartao + totalGastosDinheiro);

      // Formatar a data
      viagem.dateFormatted = formatDate(viagem.date);

      // Renderizar a página com todos os dados necessários
      res.render('viagem', {
        viagem,
        totalGastosCartao,
        totalGastosDinheiro,
        quantiaDisponivel
      });
    })
    .catch(err => {
      console.error('Erro ao buscar detalhes da viagem:', err.response ? err.response.data : err.message);
      res.render('error', { error: err.message });
    });
});

// POST add gasto to viagem
router.post('/viagem/:id/add-gasto', verifyToken, verifyOwnership, function(req, res) {
  const gastoData = {
    name: req.body.gastoName,
    amount: req.body.gastoQuantia,
    metodoPag: req.body.pagamento
  };
  console.log('Adicionando gasto:', gastoData);
  
  axios.post(`${env.apiAccessPoint}/getviagens/${req.params.id}/add-gasto`, gastoData, {
    headers: { 'x-access-token': req.cookies.token || req.headers['x-access-token'] }
  })
    .then(response => {
      console.log('Gasto adicionado com sucesso:', response.data);
      res.redirect(`/viagem/${req.params.id}`);
    })
    .catch(err => {
      console.error('Erro ao adicionar gasto:', err.response ? err.response.data : err.message);
      res.render('error', { error: err.message });
    });
});

// POST para excluir uma viagem
router.post('/viagem/:id/delete', verifyToken, verifyOwnership, function(req, res) {
  axios.post(`${env.apiAccessPoint}/deleteViagens/${req.params.id}`, {}, {
    headers: { 'x-access-token': req.cookies.token || req.headers['x-access-token'] }
  })
    .then(response => {
      console.log('Viagem excluída com sucesso:', response.data);
      req.flash('success', 'Viagem eliminada com sucesso.');
      res.redirect('/');
    })
    .catch(err => {
      console.error('Erro ao eliminar viagem:', err.response ? err.response.data : err.message);
      req.flash('error', 'Erro ao eliminar a viagem.');
      res.redirect('/');
    });
});

// GET create task page
router.get('/create-task', verifyToken, function(req, res, next) {
  res.render('create-task');
});

// POST submit task
router.post('/submit-task', verifyToken, async function(req, res, next) {
  try {
    const taskData = {
      name: req.body.taskName,
      amount: req.body.quantiaDisp,
      description: req.body.taskDescription,
      date: req.body.date,
      userID: req.userID
    };

    const response = await axios.post(env.apiAccessPoint + "/addviagem", taskData);

    if (response.status === 200) {
      console.log('Viagem criada com sucesso!');
      req.flash('success', 'Viagem criada com sucesso.');
      res.redirect('/');
    } else {
      console.error('Erro ao criar a viagem:', response.data);
      req.flash('error', 'Erro ao criar a viagem.');
      res.status(500).send('Erro ao criar a viagem');
    }
  } catch (error) {
    console.error('Erro ao enviar dados para a API:', error.response ? error.response.data : error.message);
    req.flash('error', 'Erro ao criar a viagem.');
    res.status(500).send('Erro ao criar a viagem');
  }
});

// GET login page
router.get('/login', function(req, res) {
  res.render('login');
});

// POST login
router.post('/login', function(req, res) {
  axios.post(`${env.authServerAccessPoint}/users/login`, req.body)
    .then(response => {
      res.cookie('token', response.data.token, { httpOnly: true });
      req.flash('success', 'Login bem-sucedido. Seja bem vindo!');
      res.redirect('/');
    })
    .catch(error => {
      req.flash('error', 'Credenciais inválidas.');
      res.redirect('/login');
    });
});

// POST logout
router.post('/logout', function(req, res) {
  res.clearCookie('token');
  req.flash('success', 'Sessão terminada com sucesso.');
  res.redirect('/login');
});

// GET register page
router.get('/register', function(req, res) {
  res.render('register');
});

// POST register
router.post('/register', upload.single('profilePicture'), (req, res) => {
  const userData = {
    username: req.body.username,
    password: req.body.password,
    name: req.body.name,
    birthdate: req.body.birthdate,
    description: req.body.description,
    profilePicture: req.file ? req.file.filename : null // Guarda o caminho relativo da imagem
  };

  // Enviar os dados ao auth_server
  axios.post(`${env.authServerAccessPoint}/users/register`, userData)
    .then(response => {
        req.flash('success', 'Registro bem-sucedido. Por favor, faça login.');
        res.redirect('/login');
    })
    .catch(error => {
        console.error('Erro ao registrar:', error.response ? error.response.data : error.message);
        req.flash('error', 'Ocorreu um erro ao registrar. Tente novamente.');
        res.redirect('/register');
    });
});



// GET PROFILE
router.get('/profile', verifyToken, function(req, res) {
  const userId = req.userID;
  console.log('User ID:', userId);
  axios.get(`${env.authServerAccessPoint}/users/profile/${userId}`)
    .then(response => {
      // Aceder o objeto user dentro da resposta
      const user = response.data.user;
      res.render('profile', { user });
    })
    .catch(error => {
      console.error('Erro ao buscar perfil do utilizador:', error.response ? error.response.data : error.message);
      res.render('error', { error: 'Erro ao carregar perfil.' });
    });
});


// Rota para a página de edição de perfil
router.get('/profile/edit', verifyToken, function(req, res) {
  const userId = req.userID;

  axios.get(`${env.authServerAccessPoint}/users/profile/${userId}`)
    .then(response => {
      const user = response.data.user;
      res.render('editProfile', { user });
    })
    .catch(error => {
      console.error('Erro ao carregar perfil para edição:', error.response ? error.response.data : error.message);
      res.render('error', { error: 'Erro ao carregar perfil para edição.' });
    });
});

// Rota para processar a edição de perfil
router.post('/profile/edit', verifyToken, upload.single('profilePicture'), (req, res) => {
  const userId = req.userID; // Obter o username do token

  // Dados atualizados com base no formulário
  const updatedData = {
    name: req.body.name || undefined,
    birthdate: req.body.birthdate || undefined,
    description: req.body.description || undefined
  };

  // Verifica se há um novo arquivo de imagem
  if (req.file) {
    updatedData.profilePicture = req.file.filename; // Atualiza o nome do arquivo da imagem de perfil
  }

  // Envia a solicitação de atualização para o servidor de autenticação
  axios.put(`${env.authServerAccessPoint}/users/profile/edit/${userId}`, updatedData)
    .then(response => {
      res.redirect('/profile'); // Redireciona para o perfil atualizado
    })
    .catch(error => {
      console.error('Erro ao salvar alterações no perfil:', error.response ? error.response.data : error.message);
      res.render('error', { error: 'Erro ao salvar alterações no perfil.' });
    });
});



module.exports = router;
