const mongoose = require('mongoose')

const ingredientSchema = new mongoose.Schema({
    quantity: {type: Number, required: true},
    item: {type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true},
})


module.exports = mongoose.model('Ingredient', ingredientSchema)