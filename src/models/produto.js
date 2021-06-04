const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let ProdutoSchema = new Schema({
    nome: {
        type: String,
        required: true
    },
    preco: {
        type: Number,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
        required: true
    }
});

module.exports = mongoose.model('Produto', ProdutoSchema);