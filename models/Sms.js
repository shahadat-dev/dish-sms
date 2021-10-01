const mongoose = require("mongoose")
const Schema = mongoose.Schema

const SmsSchema = new Schema(
  {
    feederID: {
      type: Schema.Types.ObjectId,
      ref: "feeder",
      required: true,
    },
    apiResponseData: {
      type: Object,
    },
    mobile: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      default: "Test SMS",
    },
    smsCount: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6],
      default: 1,
      required: true,
    },
    smsType: {
      type: String,
      enum: [
        "NEW_USER",
        "NEW_COLLECTOR",
        "NEW_MANAGER",
        "NEW_FEEDER",
        "BILL_PAY",
        "DEPOSIT_PAY",
        "DEPOSIT_CONFIRM",
        "WARNING_SINGLE",
        "WARNING_MULTIPLE",
        "ALERT_SINGLE",
        "ALERT_MULTIPLE",
        "BROADCAST",
        "DEFAULT",
      ],
      default: "DEFAULT",
      required: true,
    },
    status: {
      type: Number,
      enum: [
        0,
        1,
        2,
        3, // 0: not sent, 1: sent, 2: failed
      ],
      default: 0,
      required: true,
    },
    local: {
      type: Number,
      enum: [
        0,
        1,
        2, // 0: unread, 1: read
      ],
      default: 0,
      required: true,
    },
    modem: {
      type: Number,
      enum: [
        0,
        1, // 1: old modem(7 port)
        2, // 2: new modem(5 port)
      ],
      default: 0,
    },
  },
  { timestamps: true }
)

module.exports = Sms = mongoose.model("sms", SmsSchema)
