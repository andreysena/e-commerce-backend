require('dotenv').config();
const mongoose = require('mongoose');

module.exports = async function(){
    try {
        mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log("Conexão com a base de dados bem sucedida!")
    } catch (error) {
        console.log("Ocorreu um error ao tentar conectar à base de dados...: " + error);
    }
}
