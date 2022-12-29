const mongoose = require('mongoose')

const itemCategorySchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true, trim: true},
    emoji: {type: String, trim: true},
})


module.exports = mongoose.model('ItemCategory', itemCategorySchema)