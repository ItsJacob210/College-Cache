const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const User = require("./UserSchema");
const ItemReport = require("./ItemReport");
const Claim = require("./Claim");
const Notification = require("./Notification");

const app = express();
const PORT = Number(process.env.PORT) || 9000;
const mongoString = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "lab";

const staticRoot = path.join(__dirname, "..");

app.use(express.json({ limit: "2mb" }));
app.use(cors());

// ---------- Helpers ----------

const EDU_EMAIL_RE = /^[^\s@]+@[^\s@]+\.edu$/i;

function publicItem(item, opts) {
  // opts: { reveal: bool } -- reveal exact_location & pickup_instructions if true
  const reveal = !!(opts && opts.reveal);
  const out = {
    _id: item._id,
    user_id: item.user_id,
    type: item.type,
    title: item.title,
    description: item.description,
    category: item.category,
    general_location: item.general_location,
    radius: item.radius,
    item_time: item.item_time,
    image_url: reveal ? item.image_url : "", // placeholder until verified for FOUND items
    drop_off_method: item.drop_off_method,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
  if (item.type === "LOST") {
    // Lost item: image is okay, exact_location should also be hidden by default
    out.image_url = item.image_url || "";
  }
  if (reveal) {
    out.exact_location = item.exact_location || "";
    out.pickup_instructions = item.pickup_instructions || "";
  }
  return out;
}

function scoreClaim(item, claim) {
  // Mock verification: a simple keyword match score 0..100
  let score = 0;
  const title = (item.title || "").toLowerCase();
  const desc = (item.description || "").toLowerCase();
  const category = (item.category || "").toLowerCase();
  const features = (claim.identifying_features || "").toLowerCase();
  const brand = (claim.brand_model || "").toLowerCase();
  const contents = (claim.contents || "").toLowerCase();

  if (category && (features.includes(category) || brand.includes(category) || contents.includes(category))) {
    score += 20;
  }
  if (features) {
    const tokens = features.split(/\s+/).filter((t) => t.length > 2);
    let hits = 0;
    tokens.forEach((t) => {
      if (title.includes(t) || desc.includes(t)) hits += 1;
    });
    score += Math.min(35, hits * 12);
  }
  if (brand && (title.includes(brand) || desc.includes(brand))) score += 20;
  if (contents) {
    const tokens = contents.split(/\s+/).filter((t) => t.length > 2);
    let hits = 0;
    tokens.forEach((t) => {
      if (desc.includes(t)) hits += 1;
    });
    score += Math.min(15, hits * 5);
  }
  if (claim.approx_loss_time && item.item_time) {
    const diffHrs = Math.abs(new Date(claim.approx_loss_time) - new Date(item.item_time)) / 36e5;
    if (diffHrs <= 24) score += 10;
  }
  return Math.max(0, Math.min(100, score));
}

async function pushNotification(user_id, message, type, item_report_id, claim_id) {
  try {
    if (!user_id) return null;
    return await Notification.create({
      user_id,
      message,
      type,
      item_report_id: item_report_id || undefined,
      claim_id: claim_id || undefined,
    });
  } catch (e) {
    return null;
  }
}

// ---------- Auth ----------

app.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, campus } = req.body || {};
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).send("Missing required fields.");
    }
    if (!EDU_EMAIL_RE.test(email)) {
      return res.status(400).send("Email must be a university (.edu) address.");
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).send("An account with that email already exists.");

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role || "STUDENT",
      campus: campus || "",
    });
    res.status(201).send({ _id: user._id, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).send("Email and password are required.");
    const user = await User.findOne({ email: email.toLowerCase(), password });
    if (!user) return res.status(401).send("Invalid email or password.");
    res.send({ _id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, campus: user.campus });
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

app.get("/me", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id || !mongoose.isValidObjectId(user_id)) return res.status(400).send("user_id is required");
    const u = await User.findById(user_id).select("firstName lastName email role campus");
    if (!u) return res.status(404).send("Not found");
    res.send(u);
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

// ---------- Item Reports ----------

app.post("/createItemReport", async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.user_id || !body.type || !body.title) {
      return res.status(400).send("user_id, type, and title are required.");
    }
    const status = body.status || (body.type === "LOST" ? "SEARCHING" : "ACTIVE");
    const item = await ItemReport.create({
      user_id: body.user_id,
      type: body.type,
      title: body.title,
      description: body.description || "",
      category: body.category || "OTHER",
      general_location: body.general_location || "",
      exact_location: body.exact_location || "",
      radius: body.radius || "",
      item_time: body.item_time ? new Date(body.item_time) : undefined,
      image_url: body.image_url || "",
      drop_off_method: body.drop_off_method || "UNKNOWN",
      pickup_instructions: body.pickup_instructions || "",
      status,
    });
    await pushNotification(
      body.user_id,
      `Your ${body.type === "LOST" ? "lost" : "found"} item report "${item.title}" was submitted.`,
      "REPORT_SUBMITTED",
      item._id
    );
    res.status(201).send(publicItem(item, { reveal: true }));
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

app.get("/getItemReports", async (req, res) => {
  try {
    const { type, category, q, location, from, to, includeResolved } = req.query;
    const filter = {};
    if (type === "LOST" || type === "FOUND") filter.type = type;
    if (category) filter.category = category;
    if (location) filter.general_location = new RegExp(escapeRe(location), "i");
    if (from || to) {
      filter.item_time = {};
      if (from) filter.item_time.$gte = new Date(from);
      if (to) filter.item_time.$lte = new Date(to);
    }
    if (!includeResolved) filter.status = { $ne: "RESOLVED" };
    if (q) {
      filter.$or = [
        { title: new RegExp(escapeRe(q), "i") },
        { description: new RegExp(escapeRe(q), "i") },
        { general_location: new RegExp(escapeRe(q), "i") },
        { category: new RegExp(escapeRe(q), "i") },
      ];
    }
    const items = await ItemReport.find(filter).sort({ createdAt: -1 }).limit(200);
    res.send(items.map((i) => publicItem(i, { reveal: false })));
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

app.get("/getItemReport", async (req, res) => {
  try {
    const { id, user_id } = req.query;
    if (!id || !mongoose.isValidObjectId(id)) return res.status(400).send("id is required");
    const item = await ItemReport.findById(id);
    if (!item) return res.status(404).send("Item not found");

    let reveal = false;
    if (user_id && mongoose.isValidObjectId(user_id)) {
      // Reveal if the requester is the reporter, or has an APPROVED claim
      if (String(item.user_id) === String(user_id)) reveal = true;
      else {
        const approved = await Claim.findOne({
          item_report_id: id,
          claimant_user_id: user_id,
          status: "APPROVED",
        });
        if (approved) reveal = true;
      }
    }
    res.send(publicItem(item, { reveal }));
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

app.get("/getMyReports", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id || !mongoose.isValidObjectId(user_id)) return res.status(400).send("user_id is required");
    const items = await ItemReport.find({ user_id }).sort({ createdAt: -1 });
    res.send(items.map((i) => publicItem(i, { reveal: true })));
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

app.post("/markRetrieved", async (req, res) => {
  try {
    const { id, user_id } = req.body || {};
    if (!id || !mongoose.isValidObjectId(id)) return res.status(400).send("id is required");
    const item = await ItemReport.findById(id);
    if (!item) return res.status(404).send("Item not found");
    item.status = "RESOLVED";
    await item.save();
    if (user_id) {
      await pushNotification(user_id, `Item "${item.title}" was marked as retrieved.`, "ITEM_RESOLVED", item._id);
    }
    if (item.user_id && String(item.user_id) !== String(user_id || "")) {
      await pushNotification(item.user_id, `Item "${item.title}" was marked as retrieved.`, "ITEM_RESOLVED", item._id);
    }
    res.send(publicItem(item, { reveal: true }));
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

// ---------- Claims ----------

app.post("/createClaim", async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.item_report_id || !body.claimant_user_id) {
      return res.status(400).send("item_report_id and claimant_user_id are required.");
    }
    const item = await ItemReport.findById(body.item_report_id);
    if (!item) return res.status(404).send("Item not found");

    const claim = await Claim.create({
      item_report_id: body.item_report_id,
      claimant_user_id: body.claimant_user_id,
      identifying_features: body.identifying_features || "",
      brand_model: body.brand_model || "",
      contents: body.contents || "",
      approx_loss_time: body.approx_loss_time ? new Date(body.approx_loss_time) : undefined,
      additional_proof: body.additional_proof || "",
      status: "PENDING",
    });
    claim.confidence_score = scoreClaim(item, claim);
    // Auto-approve if very confident; else leave PENDING for reporter/dev to approve.
    if (claim.confidence_score >= 70) {
      claim.status = "APPROVED";
    }
    await claim.save();

    if (item.status !== "RESOLVED") {
      item.status = claim.status === "APPROVED" ? "PENDING_CLAIM" : "PENDING_CLAIM";
      await item.save();
    }

    // Notify claimant
    await pushNotification(
      body.claimant_user_id,
      claim.status === "APPROVED"
        ? `Your claim for "${item.title}" was auto-approved (score ${claim.confidence_score}). View pickup details.`
        : `Your claim for "${item.title}" was submitted (score ${claim.confidence_score}). Awaiting verification.`,
      claim.status === "APPROVED" ? "CLAIM_APPROVED" : "CLAIM_SUBMITTED",
      item._id,
      claim._id
    );
    // Notify reporter
    if (item.user_id) {
      await pushNotification(
        item.user_id,
        `New claim submitted for "${item.title}" (score ${claim.confidence_score}).`,
        "CLAIM_SUBMITTED",
        item._id,
        claim._id
      );
    }

    res.status(201).send(claim);
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

app.get("/getClaim", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || !mongoose.isValidObjectId(id)) return res.status(400).send("id is required");
    const claim = await Claim.findById(id).populate("item_report_id");
    if (!claim) return res.status(404).send("Claim not found");
    res.send(claim);
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

app.get("/getClaimsForItem", async (req, res) => {
  try {
    const { item_id } = req.query;
    if (!item_id || !mongoose.isValidObjectId(item_id)) return res.status(400).send("item_id is required");
    const claims = await Claim.find({ item_report_id: item_id })
      .populate("claimant_user_id", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.send(claims);
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

app.get("/getMyClaims", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id || !mongoose.isValidObjectId(user_id)) return res.status(400).send("user_id is required");
    const claims = await Claim.find({ claimant_user_id: user_id })
      .populate("item_report_id", "title type status general_location category")
      .sort({ createdAt: -1 });
    res.send(claims);
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

app.post("/decideClaim", async (req, res) => {
  try {
    const { id, decision } = req.body || {};
    if (!id || !mongoose.isValidObjectId(id)) return res.status(400).send("id is required");
    if (decision !== "APPROVED" && decision !== "REJECTED") return res.status(400).send("decision must be APPROVED or REJECTED");
    const claim = await Claim.findById(id);
    if (!claim) return res.status(404).send("Claim not found");
    claim.status = decision;
    await claim.save();

    const item = await ItemReport.findById(claim.item_report_id);
    if (item) {
      if (decision === "APPROVED") {
        item.status = "PENDING_CLAIM";
      } else if (item.status === "PENDING_CLAIM") {
        // Revert to ACTIVE/SEARCHING if no other approved claims
        const stillApproved = await Claim.exists({ item_report_id: item._id, status: "APPROVED" });
        if (!stillApproved) item.status = item.type === "LOST" ? "SEARCHING" : "ACTIVE";
      }
      await item.save();

      await pushNotification(
        claim.claimant_user_id,
        decision === "APPROVED"
          ? `Your claim for "${item.title}" was approved. Pickup details are now available.`
          : `Your claim for "${item.title}" was denied.`,
        decision === "APPROVED" ? "CLAIM_APPROVED" : "CLAIM_REJECTED",
        item._id,
        claim._id
      );
    }

    res.send(claim);
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

// ---------- Notifications ----------

app.get("/getNotifications", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id || !mongoose.isValidObjectId(user_id)) return res.status(400).send("user_id is required");
    const list = await Notification.find({ user_id }).sort({ createdAt: -1 }).limit(50);
    res.send(list);
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

app.post("/markNotificationRead", async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id || !mongoose.isValidObjectId(id)) return res.status(400).send("id is required");
    const n = await Notification.findByIdAndUpdate(id, { read_status: true }, { new: true });
    res.send(n);
  } catch (error) {
    res.status(500).send(error.message || String(error));
  }
});

// ---------- Static / root ----------

app.get("/", (req, res) => {
  res.redirect("/login.html");
});

app.use(express.static(staticRoot));

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function start() {
  if (mongoString) {
    try {
      await mongoose.connect(mongoString, { dbName: DB_NAME });
      console.log("Connected to MongoDB:", DB_NAME);
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
    }
  } else {
    console.warn("MONGODB_URI not set; running without database (most endpoints will fail).");
  }
  app.listen(PORT, () => {
    console.log(`College Cache server listening on http://localhost:${PORT}`);
  });
}

start();
