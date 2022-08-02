const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    emoji: {type: String},
    alias: [{type: String}],
    unit: {type: String, enum: ['mass', 'volume', 'count'], require: true},
    itemCategory: {type: Schema.Types.ObjectId, ref: 'ItemCategory'}
})


module.exports = mongoose.model('Item', itemSchema)