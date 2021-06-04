let express = require('express');
let api = express.Router();
const mongoose = require('mongoose');
const LocalStorage = require('node-localstorage').LocalStorage;

let localStorage = new LocalStorage('./scratch');

const Usuario = require('../models/usuario');
const Produto = require('../models/produto');

let authenticate = require('../middleware/authMiddleware').authenticate;

module.exports = () => {

    //CADASTRAR UM ITEM NO CARRINHO DO USUÁRIO LOGADO - http://localhost:4000/carrinho/cadastrar-produto
    api.put('/cadastrar-item', authenticate, async (req, res) => {
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
            { "username": localStorage.userEmail },
            { "$push": { "carrinho": novoItem } },
            { useFindAndModify: false }, (error) => {
                if (error) {
                    console.log("Ocorreu um erro ao tentar adicionar um novo item ao carrinho...: " + error);
                } else {
                    res.status(200).send("Item adicionado com sucesso!");
                }
        });
    });


    //EDITAR UM ITEM DO CARRINHO DO USUÁRIO LOGADO - http://localhost:4000/carrinho/editar-item
    api.put('/editar-item', authenticate, (req, res) => {

        Usuario.updateOne(
            { "username": localStorage.userEmail, "carrinho._id": mongoose.Types.ObjectId(req.body.itemId) },
            { "$set": { "carrinho.$.quantidade": req.body.quantidade } } ,
            (error) => {
                if (error) {
                    console.log("Ocorreu um erro ao tentar editar um este item do carrinho: " + error);
                } else {
                    res.status(200).send("Item editado com sucesso!");
                }
        });
    });

    //REMOVER UM ITEM DO CARRINHO DO USUÁRIO LOGADO - http://localhost:4000/carrinho/remover-item
    api.put('/remover-item', authenticate, async (req, res) => {
        Usuario.updateOne(
            { "username": localStorage.userEmail },
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