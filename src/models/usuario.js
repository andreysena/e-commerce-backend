const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let Schema = mongoose.Schema;

let UsuarioSchema = new Schema({
    nome: {
        type: String,
        required: true,
    },
    foto_de_perfil: {
        nome: String,
        source: String,
        mimetype: String,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    senha: {
        type: String,
        required: true,
        select: false,
    },
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
        type: Object
    }]
});

UsuarioSchema.pre('save', async function(next) {
    const hash = await bcrypt.hash(this.senha, 10);
    this.senha = hash;

    next();
});


module.exports = mongoose.model('Usuario', UsuarioSchema);