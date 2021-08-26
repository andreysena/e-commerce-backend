require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const api = express.Router();

const Usuario = require('../models/usuario');

const authMiddleware = require('../middleware/auth');
const multerConfigs = require('../middleware/multer');

const genereteToken = (params = {}) => {
    return jwt.sign(params, process.env.SECRET, {
        expiresIn: 86400
    })
}

module.exports = () => {
    
    api.post('/cadastrar', multer(multerConfigs).single('file'), async (req, res) => {

        if (await Usuario.findOne({ "email": req.body.email }))
            return res.status(400).send({'error': "Este email já está em utilização!"});
        
        let novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
            telefone: req.body.telefone,
            cpf: req.body.cpf,
            endereco: req.body.endereco
        });

        if (req.file) {
            novoUsuario.foto_de_perfil = {
                nome: req.file.originalname,
                source: fs.readFileSync(`./tmp/uploads/${req.file.filename}`, 'base64'),
                mimetype: req.file.mimetype
            }

            fs.unlink(`./tmp/uploads/${req.file.filename}`, (error) => {
                if (error) throw error;
            });
        }

        novoUsuario.save((error, usuario) => {
            if (error) {
                return res.send({'error': "Ocorreu ao tentar cadastrar o usuário."})
            }

            usuario.senha = undefined;
            return res.status(200).send({
                usuario,
                token: genereteToken({ id: usuario._id })
            });
        });
    });

    // api.post('/foto', multer(multerConfigs).single('file'), (req, res) => {
    //     console.log(req.file);
    //     console.log("Body nome: ", req.body.nome);
    //     res.status(200).send({'message': "Upload concluído com sucesso!"});
    // });

    api.post('/login', async(req, res) => {

        const usuario = await Usuario.findOne({ "email": req.body.email }).select('+senha');

        if (!usuario)
            return res.status(400).send({'error': "Este usuário não existe!"});

        if (!await bcrypt.compare(req.body.senha, usuario.senha))
            return res.status(400).send({'error': "Senha inválida!"});

        usuario.senha = undefined;

        return res.status(200).send({
            usuario, 
            token: genereteToken({ id: usuario._id })
        });
    });

    // api.get('/logout', (req, res) => {
    //     req.logout;
    //     res.status(200).send("Você saiu da sua conta!");
    // });

    api.put('/atualizar-email/:email', (req, res) => {
        Usuario.updateOne(
            { "email": req.params.email }, 
            { "$set": { "email": req.body.novoEmail } },
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
                    return res.status(200).send({
                        success: true,
                        message: "Email atualizado com sucesso!"
                    });
                }
        });
    });

    api.put('/atualizar-senha/:email', (req, res) => {
        Usuario.findOne({ "email": req.params.email }, (error, usuario) => {
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

    api.put('/atualizar-dados/:email', (req, res) => {
        Usuario.findOne({ "email": req.params.email }, (error, usuario) => {
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

    api.get('/:email', (req, res) => {
        Usuario.find({ "email": req.params.email }, (error, usuario) => {
            if (error) {
                res.send("Ocorreu um erro ao tentar buscar os dados do usuário...: " + error);
            } else {
                res.send({usuario});
            }   
        });
    });

    return api;
}