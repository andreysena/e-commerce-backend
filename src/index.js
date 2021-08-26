require('dotenv').config();

const express = require('express');
const http = require('http');
const morgan = require('morgan');
const cors = require('cors');
const config = require('./config/index.js');
const routes = require('./routes/index.js');

const app = express();
app.server = http.createServer(app);

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({
    origin: "*",
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
}));

app.use('/v1', routes);
let port = process.env.PORT || config.port

app.server.listen(port, () => {
    console.log(`A aplicação está sendo executada na porta: ${app.server.address().port}`);
});

module.exports = app;