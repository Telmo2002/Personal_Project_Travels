const mongoose = require('mongoose');
const Grid = require('gridfs-stream');

// Crie a conexão sem as opções obsoletas
const conn = mongoose.createConnection('mongodb://127.0.0.1/travels_auth');

let gfs;

conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

module.exports = gfs;
