const mongoose = require("mongoose");

const ItemReportSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["LOST", "FOUND"], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "OTHER" },
    general_location: { type: String, default: "" },
    exact_location: { type: String, default: "" },
    radius: { type: String, default: "" },
    item_time: { type: Date },
    image_url: { type: String, default: "" },
    drop_off_method: {
      type: String,
      enum: ["ORIGINAL_LOCATION", "CAMPUS_OFFICE", "LOCKER", "UNKNOWN"],
      default: "UNKNOWN",
    },
    pickup_instructions: { type: String, default: "" },
    status: {
      type: String,
      enum: ["ACTIVE", "SEARCHING", "PENDING_CLAIM", "RESOLVED"],
      default: "ACTIVE",
    },
  },
  { versionKey: false, timestamps: true }
);

ItemReportSchema.index({ title: "text", description: "text", general_location: "text", category: "text" });

module.exports = mongoose.model("ItemReport", ItemReportSchema);
