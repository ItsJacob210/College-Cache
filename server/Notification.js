const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    item_report_id: { type: mongoose.Schema.Types.ObjectId, ref: "ItemReport" },
    claim_id: { type: mongoose.Schema.Types.ObjectId, ref: "Claim" },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "REPORT_SUBMITTED",
        "CLAIM_SUBMITTED",
        "CLAIM_APPROVED",
        "CLAIM_REJECTED",
        "ITEM_RESOLVED",
        "INFO",
      ],
      default: "INFO",
    },
    read_status: { type: Boolean, default: false },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
