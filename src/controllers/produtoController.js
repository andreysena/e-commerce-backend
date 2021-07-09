let express = require('express');
let api = express.Router();

const Produto = require('../models/produto');
const Categoria = require('../models/categoria');

module.exports = () => {

    api.post('/cadastrar', async (req, res) => {
        let novoProduto = new Produto();
        let categoriaProduto = {};

        await Categoria.findOne({ "nome": req.body.categoria }, (error, categoria) => {
            if (error) {
                console.log("Ocorreu um error ao tentar buscar a categoria informada...: " + error);
            }

            categoriaProduto = categoria;
        });

        novoProduto.nome = req.body.nome;
        novoProduto.preco = req.body.preco;
        novoProduto.categoria = categoriaProduto._id;

        novoProduto.save(error => {
            if (error) {
                console.log("Ocorreu um erro ao tentar cadastrar este produto...: " + error);
            } else {
                res.status(200).send("Produto cadastrado com sucesso!");
            }
        });
    });

    api.get('/', (req, res) => {
        Produto.find({}, (error, produtos) => {
            if (error) {
                console.log("Ocorreu um erro ao tentar listar todos os produtos...: " + error);
            } else {
                res.status(200).send(produtos);
            }
        });
    });

    api.get('/:nome', (req, res) => {
        Produto.findOne({ "nome": req.params.nome }, (error, produto) => {
            if (error) {
                console.log("Ocorreu um erro ao tentar buscar este produto...: " + error);
            } else {
                res.status(200).send(produto);
            }   
        });
    });

    api.delete('/excluir/:nome', (req, res) => {
        Produto.deleteOne({ "nome": req.params.nome }, (error) => {
            if (error) {
                console.log("Ocorreu um erro ao tentar excluir este produto...: " + error);
            } else {
                res.status(200).send("Produto excluído com sucesso!");
            }
        });
    });

    return api;
}