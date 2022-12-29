const mongoose = require('mongoose')

const recipeCategorySchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true, trim: true},
    emoji: {type: String, trim: true},
})


module.exports = mongoose.model('RecipeCategory', recipeCategorySchema)