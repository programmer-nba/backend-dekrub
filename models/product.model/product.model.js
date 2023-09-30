const mongoose = require('mongoose');
const Joi = require('joi');

const ProductSchema = new mongoose.Schema({
    code: {type: String},
    picture: [{
        type: String,
    }],
    name: {type: String, required: true, unique: true},
    detail: {type: String},
    price: {type: Number, required: true},
    quantity: {type: Number, required: true},
    category: {type: String, required: true},
});

const Product = mongoose.model("productDekrup", ProductSchema);

const validate = (data) => {
    const Schema = Joi.onject({
        picture: Joi.string().required().label("กรุณาใส่รูปภาพ"),
        name: Joi.string().required().label("กรุณากรอกชื่อสินค้า"),
        detail: Joi.string().required().label("กรุณากรอกรายละเอียดสินค้า"),
        price: Joi.string().required().label("กรุณากรอกราคาสินค้า"),
        quantity: Joi.string().required().label("กรุณากรอกจำนวนสินค้า"),
        category: Joi.string().required().label("กรุณากรอกประเภทสินค้า"),
    })
    return Schema.validate(data);
}

module.exports = { Product, validate }