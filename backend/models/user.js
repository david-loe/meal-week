const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const ItemCategory = require('./recipe/itemCategory')

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, unique: true, index: true },
  hash: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  notes: [{ recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true, unique: true, index: true }, note: { type: String, required: true } }],
  weekPlan: [
      [
    { recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true }, numberOfPortions: { type: Number, required: true } },
  ]],
  settings: {
    shoppingListOrder: [{type: mongoose.Schema.Types.ObjectId, ref: 'ItemCategory'}],
    hideInShoppingList: [{type: mongoose.Schema.Types.ObjectId, ref: 'Item'}]
  }
})

userSchema.methods.setPassword = async function (password) {
  this.hash = await bcrypt.hash(password, 10)
}

userSchema.methods.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.hash)
}

userSchema.methods.setDefaults = async function () {
  this.weekPlan = [[],[],[],[],[],[],[]]
  this.settings = {shoppingListOrder: await ItemCategory.find()}
}

module.exports = mongoose.model('User', userSchema)
