const mongoose = require('mongoose')

const itemCategorySchema = new mongoose.Schema({
    name: {type: String, required: true},
    emoji: {type: String},
})


module.exports = mongoose.model('ItemCategory', itemCategorySchema)