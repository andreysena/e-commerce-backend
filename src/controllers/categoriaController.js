let express = require('express');
let api = express.Router()

const Categoria = require('../models/categoria');

module.exports = () => {

    api.post('/cadastrar', (req, res) => {

        let novaCategoria = new Categoria();

        novaCategoria.nome = req.body.nome;

        novaCategoria.save(error => {
            if (error) {
                console.log("Ocorreu um erro ao tentar cadastrar a nova categoria...: " + error);
            } else {
                res.status(200).send("Categoria cadastrada com sucesso!");
            }
        });
    });

    api.get('/', (req, res) => {
        Categoria.find({}, (error, categorias) => {
            if (error) {
                console.log("Ocorreu um erro ao tentar listar todas as categorias...: " + error);
            } else {
                res.json(categorias);
            }
        });
    });

    api.get('/:nome', (req, res) => {
        Categoria.findOne({ "nome": req.params.nome}, (error, categoria) => {
            if (error) {
                console.log("Ocorreu um erro ao tentar encontrar esta categoria...: " + error);
            } else {
                res.status(200).send(categoria);
            }
        });
    });

    api.delete('/excluir/:nome', (req, res) => {
        Categoria.deleteOne({ "nome": req.params.nome },  (error) => {
            if (error) {
                console.log("Ocorreu um erro ao tentar excluir esta categoria...: " + error);
            } else {
                res.status(200).send("Categoria deletada com sucesso!");
            }
        });
    });

    return api;
}