const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ingredients: [
    {
      quantity: { type: Number, required: true },
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    },
  ],
  instructions: [
    {
      text: { type: String, required: true },
      ingredients: [
        {
          quantity: { type: Number, required: true },
          item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
        },
      ],
    },
  ],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  recipeCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RecipeCategory' }],
  prepTimeMin: { type: Number, required: true },
  cookTimeMin: { type: Number, required: true },
  numberOfPortions: { type: Number, required: true },
  image: { type: String },
})

recipeSchema.methods.calcIngredients = function (numberOfPortions) {
  const factor = numberOfPortions / this.numberOfPortions
  const newIngredients = []
  this.populate('ingredients')
  for (const ingredient of this.ingredients) {
    newIngredients.push({
      quantity: ingredient.quantity * factor,
      item: ingredient.item._id,
    })
  }
  return newIngredients
}

recipeSchema.pre(/^find/, function () {
  this.populate({ path: 'reviews' })
  this.populate({ path: 'recipeCategories' })
  this.populate({ path: 'author', select: 'name' })
  this.populate({ path: 'ingredients.item', model: 'Item' })
  this.populate({ path: 'instructions.ingredients.item', model: 'Item' })
  this.populate({ path: 'tags' })
})

module.exports = mongoose.model('Recipe', recipeSchema)
