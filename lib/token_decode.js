const jwt = require('jsonwebtoken');

const token_decode = (token)=>{
    const decoded = jwt.verify(token, `${process.env.JWTPRIVATEKEY}`);
    return decoded;
}

module.exports = token_decode;



