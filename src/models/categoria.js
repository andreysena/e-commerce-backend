const mongoose = require('mongoose');

let Schema = mongoose.Schema;

let CategoriaSchema = new Schema({
    nome: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Categoria', CategoriaSchema);