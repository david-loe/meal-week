const mongoose = require('mongoose')

const tagSchema = new mongoose.Schema({
    name: {type: String, required: true},
    emoji: {type: String}
})


module.exports = mongoose.model('Tag', tagSchema)