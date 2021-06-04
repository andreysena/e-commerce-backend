const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let Schema = mongoose.Schema;

let UsuarioSchema = new Schema({
    nome: {
        type: String,
        required: true,
    },
    email: String,
    senha: String,
    telefone: {
        type: String,
        required: true,
    },
    cpf: {
        type: String,
        required: true
    },
    endereco: {
        type: String,
        required: true
    },
    carrinho: [{
        _id: mongoose.Types.ObjectId,
        type: Object,
        default: {}
    }]
});

UsuarioSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Usuario', UsuarioSchema);