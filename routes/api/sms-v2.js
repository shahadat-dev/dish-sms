const express = require("express")
const router = express.Router()
const Fawn = require("fawn")
const mongoose = require("mongoose")

// Load model
const Sms = require("../../models/Sms")

const apiKey = require("../../config/keys").apiKey
const apiKey2 = require("../../config/keys").apiKey2

let counter = 0

// @route   GET /api/sms/v2/test
// @desc    Test controllers route
// @access  Public
router.get("/test", (req, res) =>
  res.json({
    msg: "sms v2 works",
  })
)

// @route   GET /api/sms/v2/reset_read
// @desc    reset sms local to 0 if status is 0
// @access  Private
router.get("/reset_read", (req, res) => {
  const DT = new Date()
  console.log(DT, req.method, req.originalUrl, req.query)

  if (!req.query.apiKey || req.query.apiKey !== apiKey2) {
    return res.status(500).json({ err: "Access Forbidden!" })
  }

  if (!req.query.modem) {
    return res.json({ status: false, msg: "modem is required" })
  }

  let modem = req.query.modem ? req.query.modem : 0

  Sms.updateMany({ status: 0, local: 1, modem }, { $set: { local: 0 } })
    .then((docs) => {
      console.log(docs.nModified)
      res.json({ status: true, count: docs.nModified })
    })
    .catch((err) => console.log(err))
})

// @route   GET /api/sms/v2/reset_failed
// @desc    reset sms to local: 0, status: 0 if, status: 3, local: 1
// @access  Private
router.get("/reset_failed", (req, res) => {
  const DT = new Date()
  console.log(DT, req.method, req.originalUrl, req.query)

  if (!req.query.apiKey || req.query.apiKey !== apiKey2) {
    return res.status(500).json({ err: "Access Forbidden!" })
  }

  if (!req.query.modem) {
    return res.json({ status: false, msg: "modem is required" })
  }

  let modem = req.query.modem ? req.query.modem : 0

  Sms.updateMany({ status: 3, local: 1, modem }, { $set: { local: 0, status: 0 } })
    .then((docs) => {
      console.log(docs.nModified)
      res.json({ status: true, count: docs.nModified })
    })
    .catch((err) => console.log(err))
})

// @route   GET /api/sms/v2/sent
// @desc    Get all sent sms (which status:1, local:1)
// @access  Private
router.get("/sent", (req, res) => {
  const DT = new Date()
  console.log(DT, req.method, req.originalUrl, req.query)

  if (!req.query.apiKey || req.query.apiKey !== apiKey2) {
    return res.status(500).json({ err: "Access Forbidden!" })
  }

  if (!req.query.modem) {
    return res.json({ status: false, msg: "modem is required" })
  }

  let modem = req.query.modem ? req.query.modem : 0

  const dt = new Date()
  let startTime,
    endTime = new Date(dt.getTime()).toISOString()

  if (req.query.time) {
    if (req.query.time == "1_hour") {
      startTime = new Date(dt.getTime() - 60 * 60 * 1000).toISOString()
    } else if (req.query.time == "Today") {
      startTime = new Date(dt.getTime() - 60 * 60 * 1000 * dt.getHours()).toISOString()
    } else if (req.query.time == "Yesterday") {
      startTime = new Date(dt.getTime() - 60 * 60 * 1000 * (dt.getHours() + 24)).toISOString()
      endTime = new Date(dt.getTime() - 60 * 60 * 1000 * dt.getHours()).toISOString()
    }
  }

  Sms.countDocuments()
    .where({
      status: 1,
      local: 1,
      modem,
      // $and: [{ updatedAt: { $gte: startTime } }, { updatedAt: { $lte: endTime } }],
      updatedAt: { $gte: startTime, $lt: endTime },
    })
    .then((count) => {
      console.log(count)
      res.json({ status: true, count })
    })
    .catch((err) => res.json({ status: false, data: err }))
})

// @route   GET /api/sms/v2/read
// @desc    Get all read sms (status:0, local=1)
// @access  Private
router.get("/read", (req, res) => {
  const DT = new Date()
  console.log(DT, req.method, req.originalUrl, req.query)

  if (!req.query.apiKey || req.query.apiKey !== apiKey2) {
    return res.status(500).json({ err: "Access Forbidden!" })
  }
  if (!req.query.modem) {
    return res.json({ status: false, msg: "modem is required" })
  }

  let modem = req.query.modem ? req.query.modem : 0

  Sms.countDocuments()
    .where({
      status: 0,
      local: 1,
      modem,
    })
    .then((count) => {
      console.log(count)
      res.json({ status: true, count })
    })
    .catch((err) => res.json({ status: false, data: err }))
})

// @route   GET /api/sms/v2/unread
// @desc    Get all unread sms (status: 0, local: 0)
// @access  Private
router.get("/unread", (req, res) => {
  const DT = new Date()
  console.log(DT, req.method, req.originalUrl, req.query)

  if (!req.query.apiKey || req.query.apiKey !== apiKey2) {
    return res.status(500).json({ err: "Access Forbidden!" })
  }

  Sms.countDocuments()
    .where({ status: 0, local: 0 })
    .then((count) => {
      console.log(count)
      res.json({ status: true, count })
    })
    .catch((err) => res.json({ status: false, data: err }))
})

// @route   GET /api/sms/v2/failed
// @desc    Get all failed sms (status: 3)
// @access  Private
router.get("/failed", (req, res) => {
  const DT = new Date()
  console.log(DT, req.method, req.originalUrl, req.query)

  if (!req.query.apiKey || req.query.apiKey !== apiKey2) {
    return res.status(500).json({ err: "Access Forbidden!" })
  }

  let modem = req.query.modem ? req.query.modem : 0

  Sms.countDocuments()
    .where({ status: 3, modem })
    .then((count) => {
      console.log(count)
      res.json({ status: true, count })
    })
    .catch((err) => res.json({ status: false, data: err }))
})

module.exports = router
