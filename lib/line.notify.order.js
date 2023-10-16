const axios = require('axios');

async function linenotify(message){
    console.log('message', message);
    try{
        await axios.post(process.env.LINE_URL,{
            message : message
        } ,{
            headers: {
                'Content-Type' : 'multipart/form-data',
                'Authorization' : `Bearer ${process.env.LINE_TOKEN_ORDER}`
            }
        }).then((res)=>{
            console.log('--แจ้งเตือน LINE--')
        }).catch((err)=>{
            console.log(err);
            console.log('--แจ้งเตือนไลน์ไม่สำเร็จ--')
        })
    }catch(err){
        console.log(err);
    }
}
module.exports = {linenotify}