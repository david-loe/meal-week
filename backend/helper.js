const User = require('./models/user')
const axios = require('axios')
const sharp = require('sharp')

function getter(model, name, defaultLimit = 10, searchAlias = false) {
  return async (req, res) => {
    const meta = {
      limit: defaultLimit,
      page: 1,
      count: null,
      countPages: null,
    }
    if (req.query.limit && parseInt(req.query.limit) <= meta.limit && parseInt(req.query.limit) > 0) {
      meta.limit = parseInt(req.query.limit)
    }
    if (req.query.page && parseInt(req.query.page) > 0) {
      meta.page = parseInt(req.query.page)
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
        conditions = { $and: [{ $or: [] }] }
        conditions.$and[0].$or.push({ name: { $regex: req.query.search, $options: 'i' } })
        if (searchAlias) conditions.$and[0].$or.push({ alias: { $regex: req.query.search, $options: 'i' } })
        message = message + " with name containing: '" + req.query.search + "'"
      }
      delete req.query.search
      for (const filter of Object.keys(req.query)) {
        if (req.query[filter] && req.query[filter].length > 0) {
          var qFilter = {}
          qFilter[filter] = req.query[filter]
          if (!('$and' in conditions)) {
            conditions.$and = []
          }
          conditions.$and.push(qFilter)
        }
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
      if ('author' in model.schema.tree) {
        var oldObject = await model.findOne({ _id: req.body._id })
        if (!oldObject.author._id.equals(req.user._id)) {
          return res.send(403)
        }
      }
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

function deleter(model) {
  return async (req, res) => {
    if (req.query.id && req.query.id !== '') {
      if ('author' in model.schema.tree) {
        var doc = await model.findOne({ _id: req.query.id })
        if (!doc.author._id.equals(req.user._id)) {
          return res.send(403)
        }
      }
      try {
        await model.deleteOne({ _id: req.query.id })
        res.send({ message: 'Success' })
      } catch (error) {
        res.status(400).send({ message: 'Error while deleting', error: error })
      }
    } else {
      return res.status(400).send({ message: 'Missing id' })
    }
  }
}


function parseHTMLStr(str){
  str = str.replaceAll('</p><p>', '\n')
  return str.replaceAll(/<[^<>]*>/g, '')
}

async function recipeParser(source, id){
  var recipe = {}
  switch (source) {
    case 'fwl':
      const data = (await axios.get('https://dq6g8f1oxafcs.cloudfront.net/api/v2/recipes/' + id)).data[0]
      recipe.name = data.title
      recipe.numberOfPortions = data.servingsNumber
      recipe.prepTimeMin = data.preparationTime
      recipe.name = data.title
      image = await sharp((await axios.get(data.imageURLs[0], {responseType: 'arraybuffer'})).data).resize({width: 450}).toFormat('jpeg').toBuffer()
      recipe.image = 'data:image/png;base64,' + image.toString('base64')
      recipe.ingredients = []
      for(const ingType of data.ingredients){
        for(const ingredient of ingType.ingredients){

        }
      }
      recipe.instructions = []
      for(const step of data.steps){
        recipe.instructions.push({text: parseHTMLStr(step.instruction)})
      }

      break;
  
    default:
      break;
  }
  return recipe
}


function displayQuantity(quantity, recipePortions, displayPortions) {
  var modulo = (quantity * displayPortions) % recipePortions
  var result = (quantity * displayPortions) / recipePortions
  if (modulo == 0) {
    return result
  } else if (modulo + '_' + recipePortions in fractions) {
    return Math.floor(result) + fractions[modulo + '_' + recipePortions]
  } else {
    return Math.round(result * 100) / 100
  }
}

const fractions = {
  '1_2': '½',
  '1_3': '⅓',
  '2_3': '⅔',
  '1_4': '¼',
  '2_4': '½',
  '3_4': '¾',
  '1_5': '⅕',
  '2_5': '⅖',
  '3_5': '⅗',
  '4_5': '⅘',
  '1_6': '⅙',
  '2_6': '⅓',
  '3_6': '½',
  '4_6': '⅔',
  '5_6': '⅚',
  '1_8': '⅛',
  '2_8': '¼',
  '3_8': '⅜',
  '4_8': '½',
  '5_8': '⅝',
  '6_8': '¾',
  '7_8': '⅞',
}


module.exports = {
  displayQuantity: displayQuantity,
  getter: getter,
  setter: setter,
  deleter: deleter,
  recipeParser: recipeParser
}