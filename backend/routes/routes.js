const router = require('express').Router()
const User = require('../models/user')
const uid = require('uid')
const i18n = require('../i18n')
const helper = require('../helper')
const Recipe = require('../models/recipe/recipe')
const Item = require('../models/recipe/item')
const ItemCategory = require('../models/recipe/itemCategory')

function getter(model, name, defaultLimit= 10, searchAlias = false){
  return async (req, res) => {
    const meta = {
      limit: defaultLimit,
      page: 1,
      count: null,
      countPages: null,
    }
    if (req.query.limit && parseInt(req.query.limit) <= meta.limit && parseInt(req.query.limit) > 0) {
      meta.limit = req.query.limit
    }
    if (req.query.page && parseInt(req.query.page) > 0) {
      meta.page = req.query.page
    }
    if (req.query.id && req.query.id != '') {
      const result = await model.findOne({ _id: req.query.id })
      if (result != null) {
        res.send({ data: result })
      } else {
        res.status(204).send({ message: 'No ' + name + ' with id ' + req.query.id })
      }
    } else {
      var conditions = {}
      var message = 'No ' + name
      if (req.query.search && req.query.search.length >= 2) {
        conditions['$or'] = [{ name: { $regex: req.query.search, $options: 'i' } }]
        if(searchAlias) conditions['$or'].push({ alias: { $regex: req.query.search, $options: 'i' } })
        message = message + " with name containing: '" + req.query.search + "'"
      }
      const result = await model.find(conditions)
      meta.count = result.length
      meta.countPages = Math.ceil(meta.count / meta.limit)
      if (result != null) {
        res.send({ meta: meta, data: result.slice(meta.limit * (meta.page - 1), meta.limit * meta.page) })
      } else {
        res.status(204).send({ message: message })
      }
    }
  }
}

router.delete('/logout', function (req, res) {
  req.logout(function (err) {
    if (err) {
      res.status(400).send({ error: err })
    }
  })
  res.send({ status: 'ok' })
})

router.get('/user', async (req, res) => {
  const { hash, _id, __v, ...user } = req.user
  res.send({
    user: user,
  })
})

router.post('/user/password', async (req, res) => {
  const user = await User.findOne({ _id: req.user._id })
  if (!user) {
    res.status(400).send({ message: "User doesn't exist!" })
  }
  if (!req.body.oldPassword || !req.body.newPassword || req.body.oldPassword.length === 0 || req.body.newPassword.length === 0) {
    res.status(400).send({ message: 'No password provided!' })
  }
  if (await user.verifyPassword(req.body.oldPassword)) {
    await user.setPassword(req.body.newPassword)
    await user.save()
    res.send({ message: 'Successfully changed password.' })
  } else {
    res.status(401).send({ message: i18n.t('alerts.request.unauthorized') })
  }
})

router.get('/recipes', getter(Recipe, 'recipe'))
router.get('/items', getter(Item, 'item', 10, true))
router.get('/itemCategories', getter(ItemCategory, 'item category', 20))

router.post('/items', async (req,res) => {
  if (
    req.body.name &&
    req.body.name !== '' &&
    req.body.unit && 
    req.body.unit !== '' &&
    req.body.itemCategory &&
    req.body.itemCategory !== ''
  ) {
    const item = new Item({
      name: req.body.name,
      unit: req.body.unit,
      itemCategory: req.body.itemCategory
    })
    try {
      const result = await item.save()
      res.send({ message: 'Success', result: result })
    } catch (error) {
      res.status(400).send({ message: 'Error while saving' })
    }
  }
})
router.post('/recipes', async (req, res) => {
  if (
    req.body.name &&
    req.body.name != '' &&
    req.body.instructions &&
    req.body.instructions != '' &&
    req.body.ingredients &&
    req.body.ingredients.length > 0
  ) {
    const ingredients = []
    for (const ingredient of req.body.ingredients) {
      ingredients.push(
        new Ingredient({
          quantity: ingredient.quantity,
          item: ingredient.item,
        }),
      )
    }
    const recipe = new Recipe({
      name: req.body.name,
      instructions: req.body.instructions,
      ingredients: ingredients,
      tags: req.body.tags,
      author: req.user._id,
      prepTimeMin: req.body.prepTimeMin,
      cookTimeMin: req.body.cookTimeMin,
      numberOfPortions: req.body.numberOfPortions,
      image: req.body.image,
    })
    try {
      const result = await recipe.save()
      res.send({ message: 'Success' , result: result})
    } catch (error) {
      res.status(400).send({ message: 'Error while saving' })
    }
  }
})

module.exports = router
