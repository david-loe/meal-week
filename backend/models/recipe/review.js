const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    author: {type: Schema.Types.ObjectId, ref: 'User', require: true},
    assessment: {type: number, min: 0, max: 5}
})


module.exports = mongoose.model('Review', reviewSchema)