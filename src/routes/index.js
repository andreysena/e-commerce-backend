const express = require('express');
const initDb = require('../../db');

const categoria = require('../controllers/categoriaController');
const produto = require('../controllers/produtoController');
const usuario = require('../controllers/usuarioController');
const carrinho = require('../controllers/carrinhoController');

let router = express();

//Iniciando a conexão com a base de dados
initDb();

router.use('/categoria', categoria());
router.use('/produto', produto());
router.use('/usuario', usuario());
router.use('/carrinho', carrinho());

module.exports = router;