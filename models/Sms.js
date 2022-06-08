const mongoose = require("mongoose")

const smsSchema = mongoose.Schema(
  {
    app: {
      type: String,
      enum: ["netfee", "bayannopay", "kistipay", "hisabnikash", "utilitybill", "agrosys"],
    },
    mobile: {
      type: String,
      required: true,
      min: 11,
      max: 11,
    },
    message: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      min: 1,
      max: 6,
    },
    type: {
      type: String,
      enum: ["auth", "bill", "payment", "alert", "bulk", "other"],
      default: "bill",
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "deleted"],
      default: "pending",
    },
    read: {
      type: Boolean,
      default: false,
    },
    senderId: {
      type: mongoose.SchemaTypes.ObjectId,
    },
  },
  {
    timestamps: true,
  }
)

/**
 * @typedef Sms
 */
const Sms = mongoose.model("Sms", smsSchema)

module.exports = Sms
