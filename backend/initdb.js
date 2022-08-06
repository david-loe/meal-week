const ItemCategory = require('./models/recipe/itemCategory')
const Item = require('./models/recipe/item')
const initData = require('./initData.json')

ItemCategory.find({}, async (err, docs) => {
    if(docs.length === 0){
        const result = await ItemCategory.insertMany(initData.itemCategories)
        console.log(result)
    }
})

Item.find({}, async (err, docs) => {
    if(docs.length === 0){
        for (const item of initData.items){
            const ic = await ItemCategory.findOne({name: item.itemCategory})
            item.itemCategory = ic._id
        }
        const result = await Item.insertMany(initData.items)
        console.log(result.populate('itemCategory'))
    }
})
