const User = require('./models/user')
const i18n = require('./i18n')
const axios = require('axios')
const sharp = require('sharp')
const Item = require('./models/recipe/item')
const Tag = require('./models/recipe/tag')
const RecipeCategory = require('./models/recipe/recipeCategory')

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
      newObject = await model.findOneAndUpdate({ _id: req.body._id }, req.body, {new: true})
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

function durationStringToMinutes(str){
  const regex = /P.*T(\d+.?\d*)H(\d+.?\d*)M/
  const matches = regex.exec(str)
  if(matches){
    return parseFloat(matches[1]) * 60 + parseFloat(matches[2])
  }else{
    return null
  }
}

function parseHTMLStr(str) {
  str = str.replaceAll('</p><p>', '\n')
  return str.replaceAll(/<[^<>]*>/g, '')
}

const units = Object.values(i18n.t('units', { returnObjects: true }))
const tagsObject = i18n.t('tags', { returnObjects: true })
const recipeCategoriesObject = i18n.t('recipeCategory', { returnObjects: true })

function matchUnit(str, Tunit) {
  var re = new RegExp('^' + i18n.t(Tunit), 'i')
  return Boolean(str.match(re))
}

async function getCategoriesOrTagsByNames(names, singleWords = false){
  var words = []
  if(!singleWords){
    for(const name of names){
      var matches = name.match(/[A-ZÄÜÖ][a-zäüöß]+/g)
      if(matches){
        words = words.concat(matches)
      }
    }
  }else{
    words = names
  }
  result = {tags: [], categories: []}
  for(const word of words){
    regex = new RegExp(word, 'i')
    for(const tag of Object.keys(tagsObject)){
      if(tagsObject[tag].match(regex)){
        result.tags.push(await Tag.findOne({name: 'tags.' + tag}))
        break
      }
    }
    for(const category of Object.keys(recipeCategoriesObject)){
      if(recipeCategoriesObject[category].match(regex)){
        result.categories.push(await RecipeCategory.findOne({name: 'recipeCategory.' + category}))
        break
      }
    }
  }
  return result
}

async function getIngredientByName(name, unit, quantity) {
  var re = new RegExp('^' + name + '$')
  const ingredient = { item: {}, quantity: 0, displayQuantity: 0, displayUnit: undefined }
  function conditions(re) {
    return {
      $or: [
      { name: { $regex: re, $options: 'i' } },
      { alias: { $regex: re, $options: 'i' } }
    ]}
  }
  ingredient.item = await Item.findOne(conditions(re))
  if (!ingredient.item) {
    firstUpperWord = name.replaceAll(/[\(\)\[\]]/g, '').match(/[A-ZÄÜÖ][a-zäüöß]+/)
    if(firstUpperWord){
      re = new RegExp('^' + firstUpperWord[0] + '$')
      ingredient.item = await Item.findOne(conditions(re))
    }
    if (!ingredient.item) {
      return {error: i18n.t('alerts.noItemFoundFor') + ': "' + name + '" (' + quantity + unit + ')'}
    }
    
  }
  ingredient.displayUnit = ingredient.item.unit.name
  ingredient.quantity = parseFloat(quantity)
  ingredient.displayQuantity = ingredient.quantity
  if(!matchUnit(unit, ingredient.item.unit.name)) {
    var match = false
    for (const converter of ingredient.item.converter) {
      if (matchUnit(unit, converter.unit.name)) {
        ingredient.displayUnit = converter.unit.name
        ingredient.displayQuantity = parseFloat(quantity)
        ingredient.quantity = ingredient.displayQuantity / converter.factor
        match = true
        break
      }
    }
    if (!match) {
      for (const miscellaneousUnit of ingredient.item.unit.miscellaneousUnits) {
        if (matchUnit(unit, miscellaneousUnit.name)) {
          ingredient.displayUnit = miscellaneousUnit.name
          ingredient.displayQuantity = parseFloat(quantity)
          ingredient.quantity = ingredient.displayQuantity * miscellaneousUnit.factor
          match = true
          break
        }
      }
    }
    if (!match) {
      return {ingredient: ingredient, error: i18n.t('alerts.noUnitFoundFor') + ': "' + unit + '" (' + name + ')'}
    }
  }
  return {ingredient: ingredient}
}

async function recipeParser(source, id) {
  const recipe = {}
  const errors = []
  switch (source) {
    case 'fwl':
      const data = (await axios.get('https://dq6g8f1oxafcs.cloudfront.net/api/v2/recipes/' + id)).data[0]
      recipe.name = data.title
      recipe.numberOfPortions = data.servingsNumber
      recipe.prepTimeMin = data.preparationTime
      image = await sharp((await axios.get(data.imageURLs[0], { responseType: 'arraybuffer' })).data).resize({ width: 450 }).toFormat('jpeg').toBuffer()
      recipe.image = 'data:image/jpg;base64,' + image.toString('base64')
      recipe.ingredients = []
      for (const ingType of data.ingredients) {
        for (const ingredient of ingType.ingredients) {
          const result = await getIngredientByName(ingredient.name, ingredient.unit, ingredient.quantity)
          if(result.ingredient) {
            recipe.ingredients.push(result.ingredient)
          } if (result.error) {
            errors.push(result.error)
          }
        }
      }
      recipe.instructions = []
      for (const step of data.steps) {
        recipe.instructions.push({ text: parseHTMLStr(step.instruction) })
      }

      if(data.categories){
        const result = await getCategoriesOrTagsByNames(data.categories)
        recipe.tags = result.tags
        recipe.recipeCategories = result.categories
      }
      if(recipe.tags){
        recipe.tags.push(await Tag.findOne({name: 'tags.thermomix'}))
      }else{
        recipe.tags = [await Tag.findOne({name: 'tags.thermomix'})]
      }

      break;
    case 'chefkoch':
      const htmlStr = (await axios.get('https://www.chefkoch.de/rezepte/' + id)).data
      const start = htmlStr.search(/\{\n\s*"@context": "http:\/\/schema\.org",\n\s*"@type": "Recipe",/)
      const end = htmlStr.indexOf('</script>', start)
      const jsonStr = htmlStr.substring(start, end)
      const data1 = JSON.parse(jsonStr)
      recipe.name = data1.name
      var portionsMatch = data1.recipeYield.match(/\d+(?= Portion)/)
      if(portionsMatch){
        recipe.numberOfPortions = portionsMatch[0]
      }
      if(data1.prepTime){
        recipe.prepTimeMin = durationStringToMinutes(data1.prepTime)
      }
      if(data1.cookTime){
        recipe.cookTimeMin = durationStringToMinutes(data1.cookTime)
      }
      image = await sharp((await axios.get(data1.image, { responseType: 'arraybuffer' })).data).resize({ width: 450 }).toFormat('jpeg').toBuffer()
      recipe.image = 'data:image/jpg;base64,' + image.toString('base64')

      const instructionTexts = data1.recipeInstructions.replaceAll(/\n+/g, '\n').split('\n')
      recipe.instructions = []
      for (const text of instructionTexts) {
        recipe.instructions.push({ text: text })
      }

      if(data1.keywords){
        const result = await getCategoriesOrTagsByNames(data1.keywords, true)
        recipe.tags = result.tags
        recipe.recipeCategories = result.categories
      }

      recipe.ingredients = []
      const ingredientRegEx = new RegExp('(\\d+|([\u00bc-\u00be\u2150-\u215e])) ?([\u00bc-\u00be\u2150-\u215e])? ?('+ units.join('|') +'|Pck\\.|Liter)?,? (.+)')
      for(const ingredient of data1.recipeIngredient){
        const match = ingredientRegEx.exec(ingredient)
        if(match == null){
          errors.push(i18n.t('alerts.matchError') + ': "' + ingredient + '"')
          continue
        }
        var quantity = 0
        if(!match[2]){
          quantity = parseInt(match[1])
        }else{
          match[3] = match[2]
        }
        if(match[3]){
          for(const fraction in Object.keys(fractions)){
            if(fractions[fraction] == match[2]){
              quantity += parseInt(fraction.substring(0,1)) / parseInt(fraction.substring(2))
              break
            }
          }
        }
        var unit = match[4] ? match[4] : i18n.t('units.count')
        const result = await getIngredientByName(match[5], unit, quantity)
        if(result.ingredient) {
          recipe.ingredients.push(result.ingredient)
        } if (result.error) {
          errors.push(result.error)
        }
      }
      break;
    case 'cookidoo':
      const data2 = (await axios.get('https://cookidoo.de/recipes/recipe/de-DE/' + id, {
        headers: {
          'accept': 'application/json'
        }
      })).data
      recipe.name = data2.title
      recipe.numberOfPortions = data2.servingSize.quantity.value
      for(const time of data2.times){
        if(time.type == 'activeTime'){
          recipe.prepTimeMin = Math.round(time.quantity.value / 60)
        }
      }
      for(const time of data2.times){
        if(time.type == 'totalTime'){
          recipe.cookTimeMin = Math.round(time.quantity.value / 60) - recipe.prepTimeMin
        }
      }
      image = await sharp((await axios.get(data2.descriptiveAssets[0].square.replace('{transformation}', 't_web600x528'), { responseType: 'arraybuffer' })).data).resize({ width: 450 }).toFormat('jpeg').toBuffer()
      recipe.image = 'data:image/jpg;base64,' + image.toString('base64')

      recipe.ingredients = []
      for (const ingGroup of data2.recipeIngredientGroups) {
        for (const ingredient of ingGroup.recipeIngredients) {
          const result = await getIngredientByName(ingredient.ingredientNotation, ingredient.unitNotation, ingredient.quantity.value)
          if(result.ingredient) {
            recipe.ingredients.push(result.ingredient)
          } if (result.error) {
            errors.push(result.error)
          }
        }
      }
      
      recipe.instructions = []
      for (const stepGroup of data2.recipeStepGroups) {
        for(const step of stepGroup.recipeSteps){
          recipe.instructions.push({ text: parseHTMLStr(step.formattedText) })
        }
      }
      if(data2.tags){
        const list = []
        for(const tag of data2.tags){
          list.push(tag.name)
        }
        for(const cat of data2.categories){
          list.push(cat.title)
        }
        const result = await getCategoriesOrTagsByNames(list)
        recipe.tags = result.tags
        recipe.recipeCategories = result.categories
      }
      if(recipe.tags){
        recipe.tags.push(await Tag.findOne({name: 'tags.thermomix'}))
      }else{
        recipe.tags = [await Tag.findOne({name: 'tags.thermomix'})]
      }
      
      break;
    default:
      break;
  }
  return { recipe: recipe, errors: errors }
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




module.exports = {
  displayQuantity: displayQuantity,
  getter: getter,
  setter: setter,
  deleter: deleter,
  recipeParser: recipeParser
}