const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
    name: {type: String, require: true},
    author: {type: Schema.Types.ObjectId, ref: 'User', require: true},
    ingredients: [{type: Schema.Types.ObjectId, ref: 'Ingredient', require: true}],
    instructions: {type: String, require: true},
    reviews: [{type: Schema.Types.ObjectId, ref: 'Review'}],
    tags: [{type: Schema.Types.ObjectId, ref: 'Tag'}],
    prepTimeMin: {type: number},
    cookTimeMin: {type: number},
    numberOfPortions: {type: number}
})


module.exports = mongoose.model('Recipe', recipeSchema)