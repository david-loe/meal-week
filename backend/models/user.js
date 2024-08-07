const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const ItemCategory = require('./recipe/itemCategory')

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, unique: true, index: true, trim: true },
  hash: { type: String, required: true },
  name: { type: String, required: true, unique: true, trim: true },
  isAdmin: {type: Boolean, required: true},
  notes: [{ recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true }, note: { type: String, required: true } }],
  weekPlan: [
      [
    { recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true }, numberOfPortions: { type: Number, required: true } },
  ]],
  settings: {
    shoppingListOrder: [{type: mongoose.Schema.Types.ObjectId, ref: 'ItemCategory'}],
    hideInShoppingList: [{item: {type: mongoose.Schema.Types.ObjectId, ref: 'Item'}, quantity: {type: Number, min: 0}}]
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
  this.settings.shoppingListOrder = await ItemCategory.find()
}

userSchema.pre(/^find((?!Update).)*$/, function () {
  this.populate({ path: 'settings.hideInShoppingList.item', model: 'Item' })
})

module.exports = mongoose.model('User', userSchema)
