const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    assessment: {type: Number, min: 0, max: 5, required: true}
})


module.exports = mongoose.model('Review', reviewSchema)