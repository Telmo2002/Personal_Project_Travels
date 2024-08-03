// authserver/models/user.js
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    birthdate: Date,
    description: String,
    dateCreated: String,
    profilePicture: {
        type: String, // Nome do arquivo ou ID do GridFS
        default: null
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
