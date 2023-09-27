const mongoose = require('mongoose');
const Joi = require('joi');

const CategorySchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
});

const Category = new mongoose.model("category", CategorySchema);

const validate = (data) => {
    const Schema = Joi.onject({
        name: Joi.string().required().label("กรุณากรอกประเภทสินค้า"),
    })
    return Schema.validate(data);
}

module.exports = { Category, validate }