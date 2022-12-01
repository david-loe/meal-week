const mongoose = require('mongoose')

const unitSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  miscellaneousUnits: [{
    name: { type: String },
    factor: { type: Number, min: 0 }
  }]
})

module.exports = mongoose.model('Unit', unitSchema)
