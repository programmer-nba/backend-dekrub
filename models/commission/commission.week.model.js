const mongoose = require('mongoose');
const Joi = require('joi');

const commission_week = new mongoose.Schema({
    data: { type: [{
        member_number: {type: String},
        commission: {type: Number},
        vat3percent: {type: Number},
        remainding_commission: {type: Number},
    }] },
    from_member: {type: String},
    timestamp: {type: String},
}, {timestamps: true})

const Commission_week = new mongoose.model("commission_week", commission_week)

module.exports = { Commission_week }