const User = require('./models/user')

function displayQuantity(quantity, recipePortions, displayPortions){
    var modulo = (quantity * displayPortions) % recipePortions
    var result = (quantity * displayPortions) / recipePortions
    if(modulo == 0){
        return result
    }else if(modulo + '_' + recipePortions in fractions){
        return Math.floor(result) + fractions[modulo + '_' + recipePortions]
    }else {
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
    displayQuantity: displayQuantity
}