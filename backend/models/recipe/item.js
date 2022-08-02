const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    unit: {type: String, enum: ['mass', 'volume', 'piece']},
    emoji: {type: String}
})


module.exports = mongoose.model('Item', itemSchema)