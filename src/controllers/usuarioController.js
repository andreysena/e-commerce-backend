let express = require('express');
let api = express.Router();
const passport = require('passport');
const LocalStorage = require('node-localstorage').LocalStorage;

let localStorage = new LocalStorage('./scratch');

const Usuario = require('../models/usuario');
const authenticate = require('../middleware/authMiddleware').authenticate;
const genereteAccessToken = require('../middleware/authMiddleware').genereteAccessToken;
const respond = require('../middleware/authMiddleware').respond;

module.exports = () => {
    
    //CADASTRAR USUÁRIO - http://localhost:4000/usuario/cadastrar
    api.post('/cadastrar', (req, res) => {
        let novoUsuario = new Usuario({
            nome: req.body.nome,
            username: req.body.email,
            telefone: req.body.telefone,
            cpf: req.body.cpf,
            endereco: req.body.endereco
        });

        Usuario.register((novoUsuario), req.body.senha, (error) => {
            if (error) {
                res.status(500).send("Ocorreu um erro ao tentar cadastrar um novo usuário...: " + error);
            }

            passport.authenticate(
                'local', {
                    session: false
                }) (req, res, () => {
                    res.status(200).send("Usuário cadastrado com sucesso!");
            });
        });
    });

    //LOGIN DE USUÁRIO - http://localhost:4000/usuario/login
    api.post('/login', passport.authenticate(
        'local', {
            session: false,
            scope: []
        }), genereteAccessToken, respond);

    //LOGOUT DE USUÁRIO - http://localhost:4000/usuario/logout
    api.get('/logout', authenticate, (req, res) => {
        req.logout;
        localStorage.setItem('userEmail', "");
        res.status(200).send("Você saiu da sua conta!");
    });

    //ATUALIZAR O EMAIL DO USUÁRIO LOGADO - http://localhost:4000/usuario/atualizar-email
    api.put('/atualizar-email', authenticate, (req, res) => {
        Usuario.updateOne(
            { "username": localStorage.userEmail }, 
            { "$set": { "username": req.body.novoEmail } },
            (error) => {
                if (error) {
                    if (error.name === 'MongoError' && error.code === 11000){
                        return res.status(422).send({
                            success: false,
                            message: "Este email já está sendo utilizado"
                        });
                    }

                    return res.status(422).send({
                        success: false,
                        message: `Ocorreu um erro ao tentar atualizar o email do usuário...: ${error}`
                    });
                } else {
                    localStorage.setItem('userEmail', req.body.novoEmail);
                    return res.status(200).send({
                        success: true,
                        message: "Email atualizado com sucesso!"
                    });
                }
        });
    });

    //ATUALIZAR SENHA DO USUÁRIO LOGADO - http://localhost:4000/usuario/atualizar-senha
    api.put('/atualizar-senha', authenticate, (req, res) => {
        Usuario.findOne({ "username": localStorage.userEmail }, (error, usuario) => {
            if (error) {
                console.log("Ocorreu um erro ao tentar encontrar as informações do usuário logado...: " + error);
            }

            usuario.changePassword(req.body.senhaVelha, req.body.novaSenha, (error) => {
                if (error) {
                    if (error.name === 'IncorrectPasswordError') {
                        return res.status(422).send({
                            success: false,
                            message: "A senha deve ser diferente da sua senha atual!"
                        });
                    }

                    return res.status(422).send({
                        success: false,
                        message: `Ocorreu um erro ao tentar atualizar a senha do usuário...: ${error}`
                    });
                } else {
                    return res.status(200).send({
                        success: true, 
                        message: "A senha do usuário foi alterada com sucesso!"
                    });
                }
            });
        });
    });

    //ATUALIZAR OS DADOS DO USUÁRIO - http://localhost:4000/usuario/atualizar-dados
    api.put('/atualizar-dados', authenticate, (req, res) => {
        Usuario.findOne({ "username": localStorage.userEmail }, (error, usuario) => {
            if (error) {
                res.send("Naõ foi possível encontrar os dados do usuário...: " + error);
            } else {
                usuario.nome = req.body.nome === usuario.nome || req.body.nome === undefined ? usuario.nome : req.body.nome;
                usuario.telefone = req.body.telefone === usuario.telefone || req.body.telefone === undefined ? usuario.telefone : req.body.telefone;
                usuario.cpf = req.body.cpf === usuario.cpf || req.body.cpf === undefined ? usuario.cpf : req.body.cpf;
                usuario.endereco = req.body.endereco === usuario.endereco || req.body.endereco === undefined ? usuario.endereco : req.body.endereco;

                usuario.save(error => {
                    if (error) {
                        res.send("Ocorreu um erro ao tentar atualizar os dados do usuário...: " + error);
                    } else {
                        res.status(200).send("Os dados do usuário foram atualizados com sucesso!");
                    }
                });
            }
        });
    });

    //EXIBIR TODOS OS USUAŔIOS CADASTRADOS - http://localhost:4000/usuario/lista
    api.get('/', (req, res) => {
        Usuario.find({}, (error, usuarios) => {
            if (error) {
                console.log("Ocorreu um erro ao tentar buscar os usuários...: " + error);
            } else {
                res.status(200).json({usuarios});
            }
        });
    });

    return api;
}