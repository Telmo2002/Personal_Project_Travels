// auth.js

const jwt = require('jsonwebtoken');

function verificaAcesso(req, res, next) {
    // Obtém o token do cabeçalho de autorização ou de cookies
    const token = req.headers['x-access-token'] || req.cookies.token;

    if (token) {
        jwt.verify(token, 'telmo2002', (err, decoded) => {
            if (err) {
                console.error('Erro ao verificar token:', err);
                return res.status(403).json({ error: 'Token inválido ou expirado.' });
            }

            // Adiciona o usuário decodificado à requisição
            req.user = decoded;
            next();
        });
    } else {
        console.error('Nenhum token fornecido.');
        res.status(403).json({ error: 'Token não fornecido.' });
    }
}

module.exports = {
    verificaAcesso
};
