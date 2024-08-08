const User = require('../models/user');

// Devolve a lista de Users
module.exports.list = () => {
    return User
        .find()
        .sort('name')
        .then(users => users)
        .catch(erro => { throw new Error(erro.message); });
};

// Procura um utilizador pelo ID
module.exports.getUser = id => {
    return User.findOne({ _id: id })
        .then(user => user)
        .catch(erro => { throw new Error(erro.message); });
};

// Procura um utilizador pelo username
module.exports.getUserByUsername = userID => {
    return User.findOne({ username: userID })
        .then(user => {
            if (!user) throw new Error('User not found');
            return user;
        })
        .catch(err => { throw new Error('Erro ao buscar utilizador: ' + err.message); });
};

// Adiciona um novo utilizador
module.exports.addUser = (user, password) => {
    return new Promise((resolve, reject) => {
        User.register(new User(user), password, (err, newUser) => {
            if (err) reject(err);
            else resolve(newUser);
        });
    });
};

// Atualiza um utilizador
module.exports.updateUser = (userID, info) => {
    return User.updateOne({ username: userID }, info)
        .then(resposta => resposta)
        .catch(erro => { throw new Error(erro.message); });
};

// Atualiza o status de um utilizador
module.exports.updateUserStatus = (id, status) => {
    return User.updateOne({ _id: id }, { active: status })
        .then(resposta => resposta)
        .catch(erro => { throw new Error(erro.message); });
};

// Atualiza a senha de um utilizador
module.exports.updateUserPassword = (id, pwd) => {
    return User.updateOne({ _id: id }, pwd)
        .then(resposta => resposta)
        .catch(erro => { throw new Error(erro.message); });
};

// Deleta um utilizador
module.exports.deleteUser = id => {
    return User.deleteOne({ _id: id })
        .then(resposta => resposta)
        .catch(erro => { throw new Error(erro.message); });
};
