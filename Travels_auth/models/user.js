// authserver/models/user.js
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: String,
    name: String,
    birthdate: Date,
    description: String,
    dateCreated: String,
    profilePicture: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
