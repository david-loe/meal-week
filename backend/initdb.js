const ItemCategory = require('./models/recipe/itemCategory')
const Item = require('./models/recipe/item')
const Tag = require("./models/recipe/tag")
const initData = require('./initData.json')

async function initDB(){
    if(await ItemCategory.find({}).length === 0){
        await ItemCategory.insertMany(initData.itemCategories)
    }
    if(await Item.find({}).length === 0){
        for (const item of initData.items){
            console.log(item)
            const ic = await ItemCategory.findOne({name: item.itemCategory})
            item.itemCategory = ic._id
        }
        await Item.insertMany(initData.items)
    }
    if(await Tag.find({}).length === 0){
        await ItemCategory.insertMany(initData.tags)
    }
}

initDB()