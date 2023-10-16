const mongoose = require('mongoose');
const Joi = require('joi');

const percent_commission = new mongoose.Schema({
    code: {type: String},
    level_one: {type: Number},
    level_two: {type: Number},
    level_three: {type: Number},
    timestamp: {type: String},
})

const Percent_Commission = new mongoose.model("percent_commission", percent_commission)

module.exports = { Percent_Commission }