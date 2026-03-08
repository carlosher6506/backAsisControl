const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>{
    const token = req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({message: 'Token requerido'});
    }
    try{
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();
    }catch(error){
        res.status(401).json({message: 'Token inválido'})
    }
}