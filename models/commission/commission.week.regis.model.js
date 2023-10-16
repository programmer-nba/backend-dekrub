const mongoose = require('mongoose');
const Joi = require('joi');

const commission_week_regis = new mongoose.Schema({
    data: { type: [{
        member_number: {type: String},
        commission: {type: Number},
        vat3percent: {type: Number},
        remainding_commission: {type: Number},
    }] },
    from_member: {type: String},
    timestamp: {type: String},
}, {timestamps: true})

const Commission_week_regis = new mongoose.model("commission_week_regis", commission_week_regis)

module.exports = { Commission_week_regis }