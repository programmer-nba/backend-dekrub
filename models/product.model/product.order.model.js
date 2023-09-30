const mongoose = require('mongoose');
const Joi = require('joi');

const orderproduct = new mongoose.Schema({
    receiptnumber: {type: String, required: true},
    customer_name: {type: String},
    customer_tel: {type: String},
    customer_address: {type: String},
    customer_line: {type: String},
    product_detail: {
        type: [{
            product_id: {type: String, required: true},
            product_name: {type: String, required: true},
            product_detail: {type: String, required: true},
            quantity: {type: Number, required: true},
            price: {type: Number, required: true},
            totalprice: {type: Number, required: true},
        }]
    },
    status: {
        type: [{
            status: {type: String},
            timestamp: {type: String},
        }]
    },
    picture: [{
        type: String,
    }],
    totalprice: {type: Number, required: true},
    timestamp: {type: Date, default: Date.now() }
})

const OrderProductModel = new mongoose.model("orderproduct", orderproduct)

const validate = (data) => {
    const Schema = Joi.object({
        customer_name: Joi.string().required().allow("").label("โปรดกรอกชื่อลูกค้า"),
        customer_tel: Joi.string().required().allow("").label("โปรดกรอกเบอร์โทรลูกค้า"),
        customer_address: Joi.string().required().allow("").label("โปรดกรอกที่อยู่ลูกค้า"),
        customer_line: Joi.string().required().allow("").label("โปรดกรอกไลน์ลูกค้า"),
        product_id: Joi.string().required().label("โปรดกรอกรหัสสินค้า"),
        money_slip: Joi.string().required().label("โปรแนบหลักฐานการโอนเงิน"),
        quantity: Joi.number().required().label("โปรดกรอกจำนวนสินค้า")
    })
    return Schema.validate(data);
}

module.exports = { OrderProductModel, validate }