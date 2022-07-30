const router = require('express').Router()
const User = require('../models/user')
const uid = require('uid')
const i18n = require('../i18n')
const helper = require('../helper')

router.delete('/logout', function(req, res){
    req.logout(function(err) {
    if (err) {
          res.status(400).send({error: err})
    }
    })
    res.send({status: 'ok'})
  })

router.get('/user', async (req, res) => {
    const {hash,_id,__v, ...user} = req.user
    res.send({
        user: user
    })
})

router.post('/user/password', async (req, res) => {
    const user = await User.findOne({_id: req.user._id})
    if(!user){
        res.status(400).send({message: 'User doesn\'t exist!'})
    }
    if(!req.body.oldPassword || !req.body.newPassword || req.body.oldPassword.length === 0 || req.body.newPassword.length === 0){
        res.status(400).send({message: 'No password provided!'})
    }
    if(await user.verifyPassword(req.body.oldPassword)){
        await user.setPassword(req.body.newPassword)
        await user.save()
        res.send({message: 'Successfully changed password.'})
    }else{
        res.status(401).send({ message: i18n.t("alerts.request.unauthorized") })
    }
})

module.exports = router;