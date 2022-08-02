const ItemCategory = require('./models/recipe/itemCategory')
const initData = require('./initData.json')

ItemCategory.find({}, async (err, docs) => {
    if(docs.length === 0){
        const result = await ItemCategory.insertMany(initData.itemCategories)
        console.log(result)
    }
})
