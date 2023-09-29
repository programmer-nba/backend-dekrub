const mongoose = require('mongoose');
const Joi = require('joi');

const commission_week = new mongoose.Schema({
    data: { type: [{
        member_number: {type: String},
        lv: {type: String},
        iden: {type: String},
        name: {type: String},
        address: {type: String},
        tel: {type: String},
        commission: {type: Number},
        vat3percent: {type: Number},
        remainding_commission: {type: Number},
    }] },
    orderid: {type: String},
    timestamp: {type: Date, default: Date.now()},
}, {timestamps: true})

const Commission_week = new mongoose.model("commission_week", commission_week)

module.exports = { Commission_week }