const express = require('express')
const router = express.Router()
const Fawn = require('fawn')
const mongoose = require('mongoose')

// Load model
const Sms = require('../../models/Sms')

const apiKey = require('../../config/keys').apiKey
const apiKey2 = require('../../config/keys').apiKey2

let counter = 0

const checkMobileNumber = function (mobile) {
  if(mobile != '01700000000' && mobile != '01800000000' && mobile != '01900000000' && mobile != '01600000000' && mobile != '01500000000' && mobile != '01400000000' && mobile != '01300000000') {
    return true
  } else {
    return false
  }
}

const isValidMobile = function (mobile) {
  var rule = /(^(\+88|0088)?(01){1}[3456789]{1}(\d){8})$/;

  if(mobile.match(rule)) {
    return true
  } else {
    return false
  }
}

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
    /* if(counter < 20) {
      return res.json(messages)
    } 
    counter = 0 */

    // console.log('reset counter', counter)
    // return res.json(messages)


    if(!req.query.apiKey || req.query.apiKey !== apiKey) {
      return res.json(messages)
    }      

    Sms.find()
      .select('_id mobile message status local')
      .where({
        status: 0, 
        local: 0, 
        smsType: { $ne: 'ALERT_MULTIPLE' }
      })
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
            .where({
              status: 0, 
              local: 0, 
              smsType: 'ALERT_MULTIPLE',
              /* updatedAt: {
                $lte: new Date(new Date().getTime()-60*60*1000).toISOString()
              } */
            })
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
        console.log(docs.nModified)
        res.json({status: true, data: docs})
      })
      .catch(err => console.log(err))
  }
)

// @route   GET /api/sms/resetFailed
// @desc    reset sms to local: 0, status: 0 if, status: 3, local: 1
// @access  Private
router.get(
  '/resetFailed',
  (req, res) => {
    const DT = new Date()
    console.log(DT, req.method, req.originalUrl, req.query)

    if(!req.query.apiKey || req.query.apiKey !== apiKey2) {
      return res.status(500).json({err: 'Access Forbidden!'})
    }

    Sms.updateMany({status: 3, local: 1}, {"$set":{local: 0, status: 0}})
      .then(docs => {
        console.log(docs.nModified)
        res.json({status: true, data: docs})
      })
      .catch(err => console.log(err))
  }
)

// @route   GET /api/sms/sent
// @desc    Get all sent sms (which status:1, local:1)
// @access  Private
router.get(
  '/sent',
  (req, res) => {
    const DT = new Date()
    console.log(DT, req.method, req.originalUrl, req.query)

    if(!req.query.apiKey || req.query.apiKey !== apiKey2) {
      return res.status(500).json({err: 'Access Forbidden!'})
    }

    const dt = new Date()
    let startTime, endTime = new Date(dt.getTime()).toISOString()

    if(req.query.time){
      if(req.query.time == '1_hour'){
        startTime = new Date(dt.getTime()-60*60*1000).toISOString()
      }
      else if(req.query.time == 'Today'){        
        startTime = new Date(dt.getTime()-60*60*1000*dt.getHours()).toISOString()
      }else if(req.query.time == 'Yesterday'){
        startTime = new Date(dt.getTime()-60*60*1000*(dt.getHours()+24)).toISOString()
        endTime = new Date(dt.getTime()-60*60*1000*dt.getHours()).toISOString()
      }    
    }

    Sms.find()
      .select('_id mobile message status feederID local smsType smsCount createdAt updatedAt')
      .where({
        status: 1, 
        local: 1,
        $and: [{updatedAt: {$gte: startTime}}, {updatedAt: {$lte: endTime}}]
      })
      .sort({updatedAt: -1})
      .then(docs => {
        if (!docs) {
          return res.status(404).json({ status: false, msg: 'There are no sms' })
        }
       
        console.log('sent: ', docs.length)

        let smsCount = 0, billPaySms = 0, bulkSms = 0, bill = 0, bulk = 0

        docs.map(doc => {
          smsCount += doc.smsCount
          if(doc.smsType == 'BILL_PAY') {
            billPaySms += doc.smsCount
            bill++
          } else {
            bulkSms += doc.smsCount
            bulk++
          }
        })

        console.log(`smsCount: ${smsCount}, \nbulk: ${bulk}, bulkSms: ${bulkSms},\nbill: ${bill} billSms: ${billPaySms}`)

        res.json({status: true, count: docs.length, smsCount, bill, bulk, bulkSms, billPaySms, docs})
      })
      .catch(err => res.json({ status: false, data: err }))
  }
)

// @route   GET /api/sms/read
// @desc    Get all read sms (status:0, local=1)
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
      // .explain('executionStats')
      .select('_id mobile message status local smsType feederID smsCount createdAt updatedAt')
      .where({
        status: 0, 
        local: 1
      })
      .sort({updatedAt: -1})
      .then(docs => {
        if (!docs) {
          return res.status(404).json({ status: false, msg: 'There are no sms' })
        }
        res.json({status: true, count: docs.length, docs})
      })
      .catch(err => res.json({ status: false, data: err }))
  }
)

// @route   GET /api/sms/unRead
// @desc    Get all unRead sms (status: 0, local: 0)
// @access  Private
router.get(
  '/unRead',
  (req, res) => {
    const DT = new Date()
    console.log(DT, req.method, req.originalUrl, req.query)

    if(!req.query.apiKey || req.query.apiKey !== apiKey2) {
      return res.status(500).json({err: 'Access Forbidden!'})
    }    

    Sms.find()
      // .explain('executionStats')
      .select('_id mobile message status local smsCount smsType feederID createdAt updatedAt')
      .where({status: 0, local: 0})
      .then(docs => {
        if (!docs) {
          return res.status(404).json({ status: false, msg: 'There are no sms' })
        }
        res.json({status: true, count: docs.length, docs})
      })
      .catch(err => res.json({ status: false, data: err }))
  }
)

// @route   GET /api/sms/failed
// @desc    Get all failed sms (status: 3)
// @access  Private
router.get(
  '/failed',
  (req, res) => {
    const DT = new Date()
    console.log(DT, req.method, req.originalUrl, req.query)

    if(!req.query.apiKey || req.query.apiKey !== apiKey2) {
      return res.status(500).json({err: 'Access Forbidden!'})
    }    

    Sms.find()
      .select('_id mobile message status local smsType feederID smsCount createdAt updatedAt')
      .where({status: 3})
      .sort({updatedAt: -1})
      .then(docs => {
        if (!docs) {
          return res.status(404).json({ status: false, msg: 'There are no sms' })
        }
        res.json({status: true, count: docs.length, docs})
      })
      .catch(err => res.json({ status: false, data: err }))
  }
)

// @route   GET /api/sms/delete
// @desc    Get all delete sms (which status=0 and local=1)
// @access  Private
router.get(
  '/delete',
  (req, res) => {
    const DT = new Date()
    console.log(DT, req.method, req.originalUrl, req.query)

    if(!req.query.apiKey || req.query.apiKey !== apiKey2) {
      return res.status(500).json({err: 'Access Forbidden!'})
    } 
    
    // Sms.updateMany(
    //   {
    //     status: 1, 
    //     local: 1, 
    //     feederID: "5d3a9f851498a04529933a7c",
    //     message: { "$regex": "তারিখের মধ্যে বকেয়া", "$options": "i" }
    //   },
    //   {"$set":{status: 4}})

    /* Sms.find(
      {
        status: 1, 
        local: 1, 
        smsType: 'ALERT_MULTIPLE',
        feederID: "5cd3d0f66895ee108394ef4d",
        // message: { "$regex": "তারিখের মধ্যে বকেয়া", "$options": "i" }
        createdAt: {
            $gte: new Date(new Date().getTime()-3*60*60*1000).toISOString()
          }
      }
    )
      .then(docs => {
        if (!docs) {
          return res.status(404).json({ status: false, msg: 'There are no sms' })
        }
       
        console.log(docs.length)
        res.json({count: docs.length, docs})
      })
      .catch(err => res.json({ status: false, data: err })) */


     

      // change message

      /* let dt = new Date('2019-07-13 18:10:48.818Z')

      Sms.updateMany({smsType: 'BROADCAST'}, {$set: 
        {
          message: `ডিশ/ইন্টারনেট ব্যবসায়ীদের জন্য সুখবর। আপনাদের জন্য নিয়ে এসেছি ডিজিটাল বিল ম্যানেজমেন্ট সফটওয়্যার। যেমন,গ্রাহকের কাছ থেকে বিল নেওয়ার সময় গ্রাহক SMS পাবে ও বিলের কপি প্রিন্ট হবে।বিস্তারিত 01309002530`        
        }
      })
      .then(docs => {
        if (!docs) {
          return res.status(404).json({ status: false, msg: 'There are no sms' })
        }
       
        console.log(docs.length)
        res.json({count: docs.length, docs})
      })
      .catch(err => res.json({ status: false, data: err })) */
      
  }
)



module.exports = router
