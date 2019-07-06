const express = require('express')
const router = express.Router()
const Fawn = require('fawn')

// Load model
const Sms = require('../../models/Sms')

const apiKey = require('../../config/keys').apiKey

// @route   GET /api/sms/test
// @desc    Test controllers route
// @access  Public
router.get(
  '/test',
  (req, res) =>
    res.json({
      msg: 'sms works'
    })
)

// @route   GET /api/sms
// @desc    Get all sms which status is 0
// @access  Private
router.get(
  '/',
  (req, res) => {
    const DT = new Date()
    console.log(DT, req.originalUrl, req.query)

    if(!req.query.apiKey || req.query.apiKey !== apiKey) {
      return res.status(500).json({err: 'Access Forbidden!'})
    }

    // Feeder.find({ controllerID: req.user.id })
    Sms.find()
      .select('_id mobile message status local')
      .where({status: 0})
      .then(items => {
        if (!items) {
          return res.status(404).json({ status: false, msg: 'There are no sms' })
        }
        console.log(items.length)
        res.json(items)
      })
      .catch(err => res.json({ status: false, data: err }))
  }
)

// @route   POST /api/sms
// @desc    Update sms status and local 
// @access  Private
router.post(
  '/',
  (req, res) => {
    const DT = new Date()
    console.log(DT, req.originalUrl, req.query, req.body)    

    if(!req.query.apiKey || req.query.apiKey !== apiKey) {
      return res.status(500).json({err: 'Access Forbidden!'})
    }

    if(!req.body.id) {
      return res.status(400).json({err: 'No id exists!'})  
    } 
    
    if(req.body.status < 0 || req.body.status >= 3) {
      return res.status(400).json({err: 'Bad data!'})   
    }

    if(req.body.local < 0 || req.body.local >= 3) {
      return res.status(400).json({err: 'Bad data!'})   
    }

    // Sms.findOneAndUpdate({_id: req.body.id}, {status: req.body.status, local: req.body.local}, (error, doc) => {
    //   if(error) {
    //     console.log(error)
    //   }
    //   console.log(doc)
    //   return res.json(doc)
    // });

    Sms.findById(req.body.id)
      .then(sms => {
        if(!sms) return res.status(404).json({err: 'Doc not found!'})

        sms.status = req.body.status || sms.status
        sms.local = req.body.local || sms.local

        sms.save().then(s => {
          return res.json({status: true, msg: 'success'})
        }).catch(err => console.log(err))
      })
  }
)



module.exports = router
