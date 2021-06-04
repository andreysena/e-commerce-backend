const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const LocalStorage = require('node-localstorage').LocalStorage;

let localStorage = new LocalStorage('./scratch');

let authConfig = require('../config/auth');

let authenticate = expressJwt({ secret: process.env.SECRET, algorithms: ['HS256'] });

let genereteAccessToken = (req, res, next) => {
    req.token = req.token || {}
    req.token = jwt.sign({
        id: req.user.id
    }, process.env.SECRET, {
        expiresIn: authConfig.experiesIn
    });

    next();
}

let respond = (req, res) => {
    localStorage.setItem('userEmail', req.user.username);
    localStorage.setItem('token', req.token);
    
    res.status(200).json({
        user: req.user.username,
        token: req.token,
    });
}

module.exports = {
    authenticate,
    genereteAccessToken,
    respond
}