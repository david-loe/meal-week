const ItemCategory = require('./models/recipe/itemCategory')
const RecipeCategory = require('./models/recipe/recipeCategory')
const Item = require('./models/recipe/item')
const Tag = require('./models/recipe/tag')
const Unit = require('./models/recipe/unit')
const initData = require('./initData.json')

function initer(model, name, data, runAfterInsert = null){
  model.find({}, (err, docs) => {
    if (docs.length === 0) {
      model.insertMany(data, (err, docs) => {
        if (err) {
          console.log(err)
        }
        console.log('Added ' + docs.length + ' ' + name)
        if(runAfterInsert !== null){
          runAfterInsert()
        }
      })
    } else {
      console.log(docs.length + ' ' + name + ' exist')
      if(runAfterInsert !== null){
        runAfterInsert()
      }
    }
  })
}

function initItems() {
  Item.find({}, async (err, docs) => {
    if (docs.length === 0) {
      for (const item of initData.items) {
        const ic = await ItemCategory.findOne({ name: item.itemCategory })
        const unit = await Unit.findOne({name: item.unit})
        item.itemCategory = ic._id
        item.unit = unit._id
        if(item.converter){
          for(const converter of item.converter){
            const convUnit = await Unit.findOne({name: converter.unit})
            converter.unit = convUnit._id
          }
        }
        
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
  initer(ItemCategory, 'item categories', initData.itemCategories, initer(Unit, 'units', initData.units, initItems()))
  // Tag
  initer(Tag, 'tags', initData.tags)
  // RecipeCategory
  initer(RecipeCategory, 'recipe categories', initData.recipeCategories)
}

initDB()
