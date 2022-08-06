const mongoose = require('mongoose')
const Ingredient = require('./ingredient')

const recipeSchema = new mongoose.Schema({
    name: {type: String, require: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', require: true},
    ingredients: [{type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', require: true}],
    instructions: {type: String, require: true},
    reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}],
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
    prepTimeMin: {type: Number},
    cookTimeMin: {type: Number},
    numberOfPortions: {type: Number},
    image: {type: Buffer}
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

recipeSchema.pre('find', function() {
    this.populate({path: 'author', select: 'name'});
    this.populate({path: 'reviews'})
    this.populate({path: 'ingredients', populate: {path: 'item', model:'Item'}})
    this.populate({path: 'tags'})
  });

module.exports = mongoose.model('Recipe', recipeSchema)