let express = require('express');
let api = express.Router();
const mongoose = require('mongoose');

const Usuario = require('../models/usuario');
const Produto = require('../models/produto');

let authenticate = require('../middleware/authMiddleware').authenticate;

module.exports = () => {

    api.put('/cadastrar-item/:email', authenticate, async (req, res) => {
        let infosProduto;

        await Produto.findOne({ "nome": req.body.nomeProduto }, (error, produto) => {
            if (error) {
                console.log("Ocorreu um erro ao tentar encontrar o produto informado...: " + error);
            }

            infosProduto = produto;
        });

        let novoItem = {
            _id: mongoose.Types.ObjectId(),
            produto: infosProduto._id,
            quantidade: req.body.quantidade
        }

        Usuario.updateOne(
            { "username": req.params.email },
            { "$push": { "carrinho": novoItem } },
            { useFindAndModify: false }, (error) => {
                if (error) {
                    console.log("Ocorreu um erro ao tentar adicionar um novo item ao carrinho...: " + error);
                } else {
                    res.status(200).send("Item adicionado com sucesso!");
                }
        });
    });

    api.put('/editar-item/:email', authenticate, (req, res) => {

        Usuario.updateOne(
            { "username": req.params.email, "carrinho._id": mongoose.Types.ObjectId(req.body.itemId) },
            { "$set": { "carrinho.$.quantidade": req.body.quantidade } } ,
            (error) => {
                if (error) {
                    console.log("Ocorreu um erro ao tentar editar um este item do carrinho: " + error);
                } else {
                    res.status(200).send("Item editado com sucesso!");
                }
        });
    });

    api.put('/remover-item/:email', authenticate, async (req, res) => {
        Usuario.updateOne(
            { "username": req.params.email },
            { "$pull": { "carrinho": { "_id": mongoose.Types.ObjectId(req.body.itemId)} } },
            { useFindAndModify: false }, (error) => {
                if (error) {
                    console.log("Ocorreu um erro ao tentar excluir um item do carrinho...: " + error);
                } else {
                    res.status(200).send("Item excluído com sucesso!");
                }
        });
    });

    return api;
}