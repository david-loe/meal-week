const mongoose = require('mongoose')

const recipeCategorySchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true},
    emoji: {type: String},
})


module.exports = mongoose.model('RecipeCategory', recipeCategorySchema)