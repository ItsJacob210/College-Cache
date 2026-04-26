const mongoose = require("mongoose");

const ClaimSchema = new mongoose.Schema(
  {
    item_report_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemReport",
      required: true,
    },
    claimant_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    identifying_features: { type: String, default: "" },
    brand_model: { type: String, default: "" },
    contents: { type: String, default: "" },
    approx_loss_time: { type: Date },
    additional_proof: { type: String, default: "" },
    confidence_score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("Claim", ClaimSchema);
