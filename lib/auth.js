require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = checkToken = async (req, res, next) => {
  const token = req.headers["token"];
  if(!token){
    return res.status(401).send({message:"invalid request"});
  }
  if (token) {
    jwt.verify(token, process.env.JWTPRIVATEKEY, (err, decoded) => {
      req.user = decoded;
      if (err) {
        jwt.verify(token,process.env.API_PARTNER_KEY,(error,decoded)=>{
          req.user = decoded;
          if(error){
            console.error('jwt',error);
              return res.status(408).json({
                success: false,
                message: "หมดเวลาใช้งานแล้ว",
                logout: true,
                description: "Request Timeout",
              });
          }else{
            const partner = ['NBA_PLATEFORM', 'NBA_OFFICE']
              if(decoded && partner.includes(decoded.partner_name)){
                     next()
              }else{
                  return res.status(401).send({message:'ไม่มีสิทธิ์เข้าถึง'});
              }
          }
      });
      }else{
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      message: "Token not provided Token ไม่ถูกต้อง",
      logout: false,
      description: "Unauthorized",
    });
  }
};
