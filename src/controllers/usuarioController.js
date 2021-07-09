let express = require('express');
let api = express.Router();
const passport = require('passport');

const Usuario = require('../models/usuario');
const authenticate = require('../middleware/authMiddleware').authenticate;
const genereteAccessToken = require('../middleware/authMiddleware').genereteAccessToken;
const respond = require('../middleware/authMiddleware').respond;

module.exports = () => {
    
    api.post('/cadastrar', (req, res) => {
        let novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
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

    api.post('/login', passport.authenticate(
        'local', {
            session: false,
            scope: []
        }), genereteAccessToken, respond);

    api.get('/logout', authenticate, (req, res) => {
        req.logout;
        res.status(200).send("Você saiu da sua conta!");
    });

    api.put('/atualizar-email/:email', authenticate, (req, res) => {
        Usuario.updateOne(
            { "username": req.params.email }, 
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

    api.put('/atualizar-senha/:email', authenticate, (req, res) => {
        Usuario.findOne({ "username": req.params.email }, (error, usuario) => {
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

    api.put('/atualizar-dados/:email', authenticate, (req, res) => {
        Usuario.findOne({ "username": req.params.email }, (error, usuario) => {
            if (error) {
                res.send("Não foi possível encontrar os dados do usuário...: " + error);
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

    api.get('/:email', async (req, res) => {

        await Usuario.findOne({ "username": req.params.email }, (error, usuario) => {
            if (error) {
                res.send("Ocorreu um erro ao tentar buscar os dados do usuário...: " + error);
            } else {
                res.send({usuario});
            }   
        });
    });

    return api;
}