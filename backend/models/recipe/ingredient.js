const mongoose = require('mongoose')

const ingredientSchema = new mongoose.Schema({
    quantity: {type: number},
    item: {type: Schema.Types.ObjectId, ref: 'Item', require: true},
})


module.exports = mongoose.model('Ingredient', ingredientSchema)