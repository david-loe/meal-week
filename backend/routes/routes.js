const router = require('express').Router()
const User = require('../models/user')
const uid = require('uid')
const i18n = require('../i18n')
const helper = require('../helper')
const Recipe = require('../models/recipe/recipe')
const Item = require('../models/recipe/item')
const ItemCategory = require('../models/recipe/itemCategory')
const RecipeCategory = require('../models/recipe/recipeCategory')
const Tag = require('../models/recipe/tag')
const Review = require('../models/recipe/review')

function getter(model, name, defaultLimit = 10, searchAlias = false) {
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
        if (searchAlias) conditions['$or'].push({ alias: { $regex: req.query.search, $options: 'i' } })
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

function setter(model) {
  return async (req, res) => {
    for (const field of Object.keys(model.schema.tree)) {
      if (model.schema.tree[field].required) {
        if (
          req.body[field] === undefined ||
          (model.schema.tree[field].type === String && req.body[field].length === 0) ||
          (model.schema.tree[field].type === Number && req.body[field] === null) ||
          (Array.isArray(model.schema.tree[field]) && req.body[field].length === 0) 
        ) {
          return res.status(400).send({ message: 'Missing ' + field })
        }
      }
    }
    var newObject = {}
    if (req.body._id && req.body._id !== '') {
      newObject = await model.findOneAndUpdate({ _id: req.body._id }, req.body)
    } else {
      newObject = new model(req.body)
    }
    try {
      const result = await newObject.save()
      res.send({ message: 'Success', result: result })
    } catch (error) {
      res.status(400).send({ message: 'Error while saving', error: error })
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
  const { hash, __v, ...user } = req.user
  res.send({
    data: user,
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
router.get('/tags', getter(Tag, 'tag', 20))
router.get('/recipeCategories', getter(RecipeCategory, 'recipe category', 20))

router.post('/items', setter(Item))

router.post('/recipes', async (req, res) => {
  req.body.author = req.user._id
  return setter(Recipe)(req,res)
})

router.post('/reviews', async (req,res) => {
  if(req.body.assessment && req.body.assessment >= 0 && req.body.assessment <= 5 && req.body.recipeId && req.body.recipeId.length > 0){
    var isNewReview = true
    var review = {}
    const recipe = await Recipe.findOne({_id: req.body.recipeId})
    for(var recipeReview of recipe.reviews){
      if(recipeReview.author == req.user._id){
        review = await Review.findOne({_id: recipeReview._id})
        review.assessment = req.body.assessment
        recipeReview = review
        isNewReview = false
        break
      }
    }
    if(isNewReview){
      review = new Review({author: req.user._id, assessment: req.body.assessment})
      recipe.reviews.push(review)
    }
    
    recipe.markModified('reviews')
    try {
      await review.save()
      const result = await recipe.save()
      res.send({ message: 'Success', result: (await result.populate('reviews')).reviews })
    } catch (error) {
      res.status(400).send({ message: 'Error while saving', error: error })
    }
  }else {
    res.status(400).send({ message: 'Missing assessment or recipeId'})
  }
  
})
module.exports = router
