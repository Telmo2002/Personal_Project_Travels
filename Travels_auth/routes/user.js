const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const auth = require('../auth/auth'); // Middleware de autenticação
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
const gfs = require('../config/gridfs');
const User = require('../models/user');


// Configuração do multer para GridFS
const storage = new GridFsStorage({
    url: 'mongodb://127.0.0.1/travels_auth',
    file: (req, file) => ({
        bucketName: 'uploads',
        filename: file.originalname
    })
});

const upload = multer({ storage });

// Rota para upload de imagem de perfil
router.post('/profile-picture', auth.verificaAcesso, upload.single('profilePicture'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado.');
    }

    User.findByIdAndUpdate(req.user._id, { profilePicture: req.file.filename }, { new: true })
        .then(user => res.status(200).json(user))
        .catch(err => res.status(500).json({ error: 'Erro ao atualizar utilizador: ' + err.message }));
});

// Rota para recuperar a imagem de perfil
router.get('/profile-picture/:filename', auth.verificaAcesso, (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (err || !file) {
            return res.status(404).json({ error: 'Arquivo não encontrado.' });
        }

        const readstream = gfs.createReadStream({ filename: file.filename });
        readstream.pipe(res);
    });
});

// Rota para obter perfil do utilizador
router.get('/profile', auth.verificaAcesso, (req, res) => {
    User.findById(req.user._id)
        .then(user => res.render('profile', { user }))
        .catch(err => res.status(500).json({ error: 'Erro ao buscar perfil: ' + err.message }));
});

// Rota para listar todos os utilizadores
router.get('/', auth.verificaAcesso, (req, res) => {
    User.find({})
        .then(users => res.status(200).json({ users }))
        .catch(err => res.status(500).json({ error: 'Erro ao listar utilizadores: ' + err.message }));
});

// Rota para obter um usuário específico
router.get('/:id', auth.verificaAcesso, (req, res) => {
    User.findById(req.params.id)
        .then(user => res.status(200).json({ user }))
        .catch(err => res.status(500).json({ error: 'Erro ao buscar utilizador: ' + err.message }));
});

// Rota para registrar um novo utilizador
router.post('/register', upload.single('profilePicture'), (req, res) => {
    console.log("Dados recebidos no backend:", req.body); // Log dos dados recebidos
    console.log("Arquivo recebido no backend:", req.file); // Log do arquivo recebido

    const { username, password, name, birthdate, description } = req.body;
    const dateCreated = new Date().toISOString().substring(0, 19);

    if (!username || !password) {
        return res.status(400).json({ error: "Nome de utilizador e senha são obrigatórios." });
    }

    const newUser = new User({
        username: username.trim(),
        name,
        birthdate: birthdate ? new Date(birthdate) : undefined,
        description,
        dateCreated,
        profilePicture: req.file ? req.file.filename : null
    });

    User.register(newUser, password, (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: "Erro ao autenticar o utilizador: " + err.message });
            }

            jwt.sign(
                { username: user.username, sub: 'telmo2002 project' },
                "telmo2002",
                { expiresIn: 3600 },
                (err, token) => {
                    if (err) {
                        return res.status(500).json({ error: "Erro na geração do token: " + err.message });
                    }
                    res.status(201).json({ token });
                }
            );
        });
    });
});



// Rota para login
router.post('/login', (req, res, next) => {
    req.body.username = req.body.username.trim();
    next();
}, passport.authenticate('local'), (req, res) => {
    jwt.sign(
        { username: req.user.username, sub: 'telmo2002 project' },
        "telmo2002",
        { expiresIn: 3600 },
        (err, token) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao gerar token: ' + err.message });
            }
            res.status(200).json({ token });
        }
    );
});

module.exports = router;
