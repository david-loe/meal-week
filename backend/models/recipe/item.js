const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String },
  alias: [{ type: String }],
  unit: { type: String, enum: ['units.mass', 'units.volume', 'units.count'], required: true },
  itemCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemCategory', required: true },
})

module.exports = mongoose.model('Item', itemSchema)
