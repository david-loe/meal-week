const ItemCategory = require('./models/recipe/itemCategory')
const Item = require('./models/recipe/item')
const Tag = require('./models/recipe/tag')
const initData = require('./initData.json')

async function initDB() {
  await ItemCategory.find({}, (err, docs) => {
    if (docs.length === 0) {
      ItemCategory.insertMany(initData.itemCategories, (err, docs) => {
        console.log('Added ' + docs.length + ' ItemCategories')
      })
    } else {
      console.log(docs.length + ' ItemCategories exist')
    }
  }).then
  Item.find({}, async (err, docs) => {
    if (docs.length === 0) {
      for (const item of initData.items) {
        const ic = await ItemCategory.findOne({ name: item.itemCategory })
        item.itemCategory = ic._id
      }
      Item.insertMany(initData.items, (err, docs) => {
        console.log('Added ' + docs.length + ' Items')
      })
    } else {
      console.log(docs.length + ' Items exist')
    }
  })
}

initDB()
