require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
	const authHeader = req.headers.authorization;
	
	if (!authHeader)
		return res.status(401).send({ 'error': "O token não foi enviado!" });

	const parts = authHeader.split(' ');

	if (!parts.length === 2)
		return res.status(401).send({ 'error': "Erro no token!" });

	const [ scheme, token ] = parts;

	if (!/^Bearer$/i.test(scheme))
		return res.status(401).send({ 'error': "Token mal formatado!" });


	jwt.verify(token, process.env.SECRET, (error, decoded) => {
		if (error)
			return res.status(401).send({ 'error': "Token inválido!" });

		req.useId = decoded.id;

		return next();
	});
};