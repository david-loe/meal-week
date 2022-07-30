const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {type: String, require: true, lowercase: true, unique: true, index: true},
    hash: {type: String, require: true},
    name: {type: String, require: true, unique: true}
})

userSchema.methods.setPassword = async function(password){
    this.hash = await bcrypt.hash(password, 10)
}

userSchema.methods.verifyPassword = async function(password){
    return await bcrypt.compare(password, this.hash)
}

module.exports = mongoose.model('User', userSchema)