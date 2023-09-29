const mongoose = require('mongoose');
const Joi = require('joi');

const commission_day = new mongoose.Schema({
    data: { type: [{
        member_number: {type: String},
        commission: {type: Number},
        vat3percent: {type: Number},
        remainding_commission: {type: Number},
    }] },
    from_member: {type: String},
    timestamp: {type: Date, default: Date.now()},
}, {timestamps: true})

const Commission_day = new mongoose.model("commission_day", commission_day)

module.exports = { Commission_day }