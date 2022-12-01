const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String },
  alias: [{ type: String }],
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true },
  itemCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemCategory', required: true },
  converter: [{
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit' },
    factor: {type: Number, min: 0}
  }]
})

itemSchema.pre(/^find/, function () {
  this.populate({ path: 'unit' })
  this.populate({ path: 'converter.unit', model: 'Unit' })
})

itemSchema.post(/^save/, function (doc, next) {
  doc.populate({ path: 'unit' }).then(function(){
    doc.populate({ path: 'converter.unit', model: 'Unit' }).then(function(){
      next()
    })
  })
})

module.exports = mongoose.model('Item', itemSchema)