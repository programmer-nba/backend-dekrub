require("dotenv").config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));
const cors = require('cors');

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB,{ useNewUrlParser: true });

app.use(express.json());
app.use(cors());

app.use('/dekrup-shop', require("./routes/index"));

//Admin
app.use('/dekrup-shop/admin', require('./routes/admin/admin.user')); 

//Member
app.use('/dekrup-shop/member', require('./routes/member/member.user')); 

//products
app.use('/dekrup-shop/product', require('./routes/product/index'));
app.use('/dekrup-shop/product/category', require('./routes/product/category'));
//Order
app.use('/dekrup-shop/order', require('./routes/order/index'));

const port = process.env.PORT || 9060;

app.listen(port,() => {
    console.log(`API Runing PORT ${port}`);
});