const ItemCategory = require('./models/recipe/itemCategory')
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
        if(err){
          console.log(err)
        }
        console.log('Added ' + result.length + ' Items')
      })
    } else {
      console.log(docs.length + ' Items exist')
    }
  })
}

function initDB() {
  ItemCategory.find({}, (err, docs) => {
    if (docs.length === 0) {
      ItemCategory.insertMany(initData.itemCategories, (err, docs) => {
        if(err){
          console.log(err)
        }
        console.log('Added ' + docs.length + ' ItemCategories')
        initItems()
      })
    } else {
      console.log(docs.length + ' ItemCategories exist')
      initItems()
    }
  })
  
}

initDB()
