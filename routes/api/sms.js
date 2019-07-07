const express = require('express')
const router = express.Router()
const Fawn = require('fawn')
const mongoose = require('mongoose')

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
    console.log(DT, req.method, req.originalUrl, req.query)

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

// @route   POST /api/sms/update?apiKey=value&id=value&status=0&local=1
// @desc    Update sms status and local 
// @access  Private
router.post(
  '/update',
  (req, res) => {
    const DT = new Date()
    console.log(DT, req.method, req.originalUrl, req.query)    

    if(!req.query.apiKey || req.query.apiKey !== apiKey) {
      return res.status(500).json({err: 'Access Forbidden!'})
    }

    if(!req.query.id) {
      return res.status(400).json({err: 'No id exists!'})  
    }

    if(!mongoose.Types.ObjectId.isValid(req.query.id)) {
      return res.status(400).json({err: 'Invalid ID!'})  
    }
    
    if(req.query.status < 0 || req.query.status >= 3) {
      return res.status(400).json({err: 'Bad data!'})   
    }

    if(req.query.local < 0 || req.query.local >= 3) {
      return res.status(400).json({err: 'Bad data!'})   
    }    

    // return res.json({msg: 'done'})

    // Sms.findOneAndUpdate({_id: req.body.id}, {status: req.body.status, local: req.body.local}, (error, doc) => {
    //   if(error) {
    //     console.log(error)
    //   }
    //   console.log(doc)
    //   return res.json(doc)
    // });

    Sms.findById(req.query.id)
      .then(sms => {
        if(!sms) return res.status(404).json({err: 'Document not found!'})

        sms.status = req.query.status || sms.status
        sms.local = req.query.local || sms.local

        sms.save().then(s => {
          return res.json({status: true, msg: 'success'})
        }).catch(err => console.log(err))
      })
  }
)



module.exports = router
