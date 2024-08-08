const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
// const auth = require('../auth/auth'); // Middleware de autenticação
const User = require('../controllers/user')
const UserModel = require('../models/user');

// Rota para listar todos os utilizadores
router.get('/', (req, res) => {
    User.find({})
        .then(users => res.status(200).json({ users }))
        .catch(err => res.status(500).json({ error: 'Erro ao listar utilizadores: ' + err.message }));
});

// Rota para obter um usuário específico
// router.get('/profile/:userID', async (req, res) => {
//     try {
//         const user = await User.getUserByUsername(req.params.userID);
//         if (!user) {
//             return res.status(404).json({ error: 'Utilizador não encontrado' });
//         }
//         res.status(200).json({ user });
//     } catch (err) {
//         console.error('Erro ao procurar o utilizador:', err.message);
//         res.status(500).json({ error: 'Erro ao procurar o utilizador: ' + err.message });
//     }
// });


// Rota de teste para procurar um utilizador diretamente pelo username



//Rota para obter um utilizador específico
router.get('/profile/:userID', (req, res) => {
    User.getUserByUsername(req.params.userID)
        .then(user => {
            console.log(user)
            if (!user) {
                return res.status(404).json({ error: 'Utilizador não encontrado' });
            }
            res.status(200).json({ user });
        })
        .catch(err => {
            console.error('Erro ao buscar utilizador:', err.message); // Log detalhado
            res.status(500).json({ error: 'Erro ao buscar utilizador: ' + err.message });
        });
});


// Rota para editar um utilizador existente
// Rota para editar um utilizador existente
router.put('/profile/edit/:userID', (req, res) => {
    const userId = req.params.userID;
    const updatedInfo = req.body;

    // Prepara o objeto de atualização, omitindo campos que não estão presentes
    const updateFields = {};
    if (updatedInfo.name) updateFields.name = updatedInfo.name;
    if (updatedInfo.birthdate) updateFields.birthdate = updatedInfo.birthdate;
    if (updatedInfo.description) updateFields.description = updatedInfo.description;
    if (updatedInfo.profilePicture) updateFields.profilePicture = updatedInfo.profilePicture;

    // Atualiza o usuário com os campos preparados
    User.updateUser(userId, updateFields)
        .then(result => {
            if (result.nModified === 0) {
                return res.status(404).json({ message: 'Utilizador não encontrado ou nenhuma alteração realizada.' });
            }
            res.status(200).json({ message: 'Utilizador atualizado com sucesso!' });
        })
        .catch(err => {
            console.error('Erro ao atualizar utilizador:', err.message);
            res.status(500).json({ error: 'Erro ao atualizar utilizador: ' + err.message });
        });
});




// Rota para registrar um novo utilizador
router.post('/register', (req, res) => {
    const { username, password, name, birthdate, description , profilePicture} = req.body;
    const dateCreated = new Date().toISOString().substring(0, 19);

    // Verificar campos obrigatórios
    if (!username || !password) {
        return res.status(400).json({ error: "Nome de usuário e senha são obrigatórios." });
    }

    // Criar o novo usuário
    const newUser = new UserModel({
        username: username.trim(),
        name,
        birthdate: birthdate ? new Date(birthdate) : undefined,
        description,
        dateCreated,
        profilePicture
    });

    // Registrar o usuário usando o método `register` do `passport-local-mongoose`
    UserModel.register(newUser, password, (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Respondendo que o registro foi bem-sucedido
        res.status(201).json({ message: 'Utilizador registrado com sucesso!' });
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
