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

app.use('/dekrub-shop', require("./routes/index"));

//Admin
app.use('/dekrub-shop/admin', require('./routes/admin/admin.user')); 

//Member
app.use('/dekrub-shop/member', require('./routes/member/member.user')); 
app.use('/dekrub-shop/public/member', require('./routes/public/member'));

//products
app.use('/dekrub-shop/product', require('./routes/product/index'));
app.use('/dekrub-shop/product/category', require('./routes/product/category'));

//Order
app.use('/dekrub-shop/order', require('./routes/order/index'));
app.use('/dekrub-shop/order/member', require('./routes/order/member.new'));

//comnission
app.use('/dekrub-shop/commission', require('./routes/commission/index'));

//more
app.use('/dekrub-shop/more/function_more', require('./routes/more/function.more'));
app.use('/dekrub-shop/delete/image', require('./routes/more/delete.image'));
app.use('/dekrub-shop/image/collection', require('./routes/more/image.collection'));

//Thailand
app.use("/dekrub-shop/thailand", require("./routes/thailand"));

const port = process.env.PORT || 9060;

app.listen(port,() => {
    console.log(`API Runing PORT ${port}`);
});