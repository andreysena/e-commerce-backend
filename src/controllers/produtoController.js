const express = require('express');
const api = express.Router();
const multer = require('multer');
const fs = require('fs');

const Produto = require('../models/produto');
const Categoria = require('../models/categoria');

const multerConfigs = require('../middleware/multer');

module.exports = () => {

    api.post('/cadastrar', multer(multerConfigs).single('file'), async(req, res) => {
        let novoProduto = new Produto();
        let categoriaProduto = {};

        await Categoria.findOne({ "nome": req.body.categoria }, (error, categoria) => {
            if (error) {
                res.send("Ocorreu um error ao tentar buscar a categoria informada...: " + error);
            }

            categoriaProduto = categoria;
        });

        novoProduto.nome = req.body.nome;
        novoProduto.preco = req.body.preco;
        novoProduto.categoria = categoriaProduto._id;

        if (req.file) {
            novoProduto.foto_do_produto = {
                nome: req.file.originalname,
                source: fs.readFileSync(`./tmp/uploads/${req.file.filename}`, 'base64'),
                mimetype: req.file.mimetype
            }

            fs.unlink(`./tmp/uploads/${req.file.filename}`, (error) => {
                if (error) throw error;
            });
        }

        novoProduto.save(error => {
            if (error) {
                res.send("Ocorreu um erro ao tentar cadastrar este produto...: " + error);
            } else {
                res.status(200).send("Produto cadastrado com sucesso!");
            }
        });
    });

    api.get('/', (req, res) => {
        Produto.find({}, (error, produtos) => {
            if (error) {
                res.send("Ocorreu um erro ao tentar listar todos os produtos...: " + error);
            } else {
                res.status(200).send(produtos);
            }
        });
    });

    api.get('/:nome', async (req, res) => {
        let searchResults = [];

        await Produto.find({ "nome": new RegExp('^' + req.params.nome, 'i') }, (error, result) => {
            searchResults = searchResults.concat(result);
        });

        await Produto.find({ "nome": new RegExp(req.params.nome + '$', 'i') }, (error, result) => {
            searchResults = searchResults.concat(result); 
        });
        
        if (searchResults.length === 0) {
            res.send("Nenhum produto com esse nome foi encontrado...");
        } else {
            res.status(200).send(searchResults);
        }
    });

    api.delete('/excluir/:nome', (req, res) => {
        Produto.deleteOne({ "nome": req.params.nome }, (error) => {
            if (error) {
                res.send("Ocorreu um erro ao tentar excluir este produto...: " + error);
            } else {
                res.status(200).send("Produto excluído com sucesso!");
            }
        });
    });

    return api;
}