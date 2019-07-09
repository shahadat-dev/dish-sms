const express = require('express')
const router = express.Router()
const Fawn = require('fawn')
const mongoose = require('mongoose')

// Load model
const Sms = require('../../models/Sms')

const apiKey = require('../../config/keys').apiKey
const apiKey2 = require('../../config/keys').apiKey2

let counter = 0

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
// @desc    Get all sms which status:0 & local:0
// @access  Private
router.get(
  '/',
  (req, res) => {
    const DT = new Date()
    let messages = []  


    counter++
    
    console.log(DT, ' read', counter)
    if(counter < 30) {
      return res.json(messages)
    } 
    counter = 0

    // console.log('reset counter', counter)
    // return res.json(messages)


    if(!req.query.apiKey || req.query.apiKey !== apiKey) {
      return res.json(messages)
    }      

    Sms.find()
      .select('_id mobile message status local')
      .where({status: 0, local: 0, smsType: { $ne: 'ALERT_MULTIPLE' }})
      .limit(20)
      .then(docs => {        
        console.log('market: ', docs.length)
        messages = docs.map(doc => {
          let obj = doc.toObject()
          obj.id = obj._id
          delete obj._id

          // console.log(obj)
          return obj
        })        

        if(docs.length < 20) {
          Sms.find()
            .select('_id mobile message status local')
            .where({status: 0, local: 0, smsType: 'ALERT_MULTIPLE' })
            .limit(20-docs.length)
            .then(docs2 => {  

              console.log('bulk: ', docs2.length)
              let messages2 = []
              messages2 = docs2.map(doc => {
                let obj = doc.toObject()
                obj.id = obj._id
                delete obj._id

                // console.log(obj)
                return obj
              })
              console.log('total: ', messages.concat(messages2).length)

              return res.json(messages.concat(messages2))
            })
        } else {          
          res.json(messages)
        }

      })
      .catch(err => res.json({ status: false, data: err }))
  }
)

// @route   POST /api/sms/update?apiKey=value&id=value&status=0&local=1
// @desc    Update sms status and local 
// @access  Private
router.get(
  '/update',
  (req, res) => {
    const DT = new Date()
    console.log('update: ', DT, req.query)    

    if(!req.query.apiKey || req.query.apiKey !== apiKey) {
      return res.status(500).json({err: 'Access Forbidden!'})
    }

    if(!req.query.id) {
      return res.status(400).json({err: 'No id exists!'})  
    }

    if(!mongoose.Types.ObjectId.isValid(req.query.id)) {
      return res.status(400).json({err: 'Invalid ID!'})  
    }
    
    if(req.query.status < 0 || req.query.status > 3) {
      return res.status(400).json({err: 'Bad data!'})   
    }

    if(req.query.local < 0 || req.query.local > 3) {
      return res.status(400).json({err: 'Bad data!'})   
    } 

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


// @route   GET /api/sms/reset
// @desc    reset sms local to 0 if status is 0
// @access  Private
router.get(
  '/reset',
  (req, res) => {
    const DT = new Date()
    console.log(DT, req.method, req.originalUrl, req.query)

    if(!req.query.apiKey || req.query.apiKey !== apiKey2) {
      return res.status(500).json({err: 'Access Forbidden!'})
    }

    Sms.updateMany({status: 0, local: 1}, {"$set":{local: 0}})
      .then(docs => {
        console.log(docs.length)
        res.json(docs)
      })
      .catch(err => console.log(err))
  }
)

// @route   GET /api/sms/sent
// @desc    Get all sent sms (which status and local both is 1)
// @access  Private
router.get(
  '/sent',
  (req, res) => {
    const DT = new Date()
    console.log(DT, req.method, req.originalUrl, req.query)

    if(!req.query.apiKey || req.query.apiKey !== apiKey2) {
      return res.status(500).json({err: 'Access Forbidden!'})
    }    

    Sms.find()
      .select('_id mobile message status local')
      .where({status: 1, local: 1})
      .then(docs => {
        if (!docs) {
          return res.status(404).json({ status: false, msg: 'There are no sms' })
        }
       
        console.log(docs.length)
        res.json({count: docs.length, docs})
      })
      .catch(err => res.json({ status: false, data: err }))
  }
)

// @route   GET /api/sms/read
// @desc    Get all read sms (which status=0 and local=1)
// @access  Private
router.get(
  '/read',
  (req, res) => {
    const DT = new Date()
    console.log(DT, req.method, req.originalUrl, req.query)

    if(!req.query.apiKey || req.query.apiKey !== apiKey2) {
      return res.status(500).json({err: 'Access Forbidden!'})
    }    

    Sms.find()
      .select('_id mobile message status local')
      .where({status: 0, local: 1})
      .then(docs => {
        if (!docs) {
          return res.status(404).json({ status: false, msg: 'There are no sms' })
        }
       
        console.log(docs.length)
        res.json({count: docs.length, docs})
      })
      .catch(err => res.json({ status: false, data: err }))
  }
)



module.exports = router
