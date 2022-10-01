const ItemCategory = require('./models/recipe/itemCategory')
const RecipeCategory = require('./models/recipe/recipeCategory')
const Item = require('./models/recipe/item')
const Tag = require('./models/recipe/tag')
const initData = require('./initData.json')

function initItems() {
  Item.find({}, async (err, docs) => {
    if (docs.length === 0) {
      for (const item of initData.items) {
        const ic = await ItemCategory.findOne({ name: item.itemCategory })
        item.itemCategory = ic._id
      }
      Item.insertMany(initData.items, (err, result) => {
        if (err) {
          console.log(err)
        }
        console.log('Added ' + result.length + ' items')
      })
    } else {
      console.log(docs.length + ' Items exist')
    }
  })
}

function initDB() {
  // ItemCategory and Item
  ItemCategory.find({}, (err, docs) => {
    if (docs.length === 0) {
      ItemCategory.insertMany(initData.itemCategories, (err, docs) => {
        if (err) {
          console.log(err)
        }
        console.log('Added ' + docs.length + ' item categories')
        initItems()
      })
    } else {
      console.log(docs.length + ' ItemCategories exist')
      initItems()
    }
  })
  // Tag
  Tag.find({}, (err, docs) => {
    if (docs.length === 0) {
      Tag.insertMany(initData.tags, (err, docs) => {
        if (err) {
          console.log(err)
        }
        console.log('Added ' + docs.length + ' tags')
      })
    }
  })
  // RecipeCategory
  RecipeCategory.find({}, (err, docs) => {
    if (docs.length === 0) {
      RecipeCategory.insertMany(initData.recipeCategories, (err, docs) => {
        if (err) {
          console.log(err)
        }
        console.log('Added ' + docs.length + ' recipe categories')
      })
    }
  })
}

initDB()
