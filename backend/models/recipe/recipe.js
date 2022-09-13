const mongoose = require('mongoose')
const Ingredient = require('./ingredient')

const recipeSchema = new mongoose.Schema({
    name: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    ingredients: [{type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true}],
    instructions: {type: String, required: true},
    reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}],
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
    prepTimeMin: {type: Number,  required: true},
    cookTimeMin: {type: Number,  required: true},
    numberOfPortions: {type: Number,  required: true},
    image: {type: String}
})

recipeSchema.methods.calcIngredients = function(numberOfPortions){
    const factor = numberOfPortions / this.numberOfPortions
    const newIngredients = []
    this.populate('ingredients')
    for (const ingredient of this.ingredients){
        newIngredients.push(new Ingredient({
            quantity: ingredient.quantity * factor,
            item: ingredient.item._id
        }))
    }
    return newIngredients
}

recipeSchema.pre(/^find/, function() {
    this.populate({path: 'reviews'})
    this.populate({path: 'author', select: 'name'})
    this.populate({path: 'ingredients', populate: {path: 'item', model:'Item'}})
    this.populate({path: 'tags'})
  });

module.exports = mongoose.model('Recipe', recipeSchema)