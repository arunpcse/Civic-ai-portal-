const mongoose = require("mongoose");

// 1. Corporation Schema
const corporationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Corporation name is required"],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    tamilName: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "Tamil Nadu",
    },
    district: {
      type: String,
      required: true,
    },
    centerLat: {
      type: Number,
      required: true,
      default: 13.0827,
    },
    centerLng: {
      type: Number,
      required: true,
      default: 80.2707,
    },
  },
  { timestamps: true }
);

// 2. Zone Schema
const zoneSchema = new mongoose.Schema(
  {
    corporationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporation",
      required: [true, "Corporation reference is required"],
    },
    zoneNumber: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: [true, "Zone name is required"],
      trim: true,
    },
    tamilName: {
      type: String,
      default: "",
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    centerLat: {
      type: Number,
      required: true,
      default: 13.0827,
    },
    centerLng: {
      type: Number,
      required: true,
      default: 80.2707,
    },
    radiusKm: {
      type: Number,
      default: 4.0,
    },
  },
  { timestamps: true }
);

// 3. Ward Schema
const wardSchema = new mongoose.Schema(
  {
    corporationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporation",
      required: true,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: [true, "Zone reference is required"],
    },
    wardNumber: {
      type: Number,
      required: true,
    },
    wardName: {
      type: String,
      required: [true, "Ward name is required"],
      trim: true,
    },
    tamilName: {
      type: String,
      default: "",
    },
    centerLat: {
      type: Number,
      required: true,
      default: 13.0827,
    },
    centerLng: {
      type: Number,
      required: true,
      default: 80.2707,
    },
    radiusKm: {
      type: Number,
      default: 1.5,
    },
  },
  { timestamps: true }
);

// 4. Locality Schema
const localitySchema = new mongoose.Schema(
  {
    corporationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporation",
      required: true,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
      required: [true, "Ward reference is required"],
    },
    name: {
      type: String,
      required: [true, "Locality name is required"],
      trim: true,
    },
    tamilName: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "600001",
    },
    centerLat: {
      type: Number,
      default: 13.0827,
    },
    centerLng: {
      type: Number,
      default: 80.2707,
    },
  },
  { timestamps: true }
);

// 5. Street Schema
const streetSchema = new mongoose.Schema(
  {
    corporationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporation",
      required: true,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      required: true,
    },
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
      required: true,
    },
    localityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Locality",
      required: [true, "Locality reference is required"],
    },
    name: {
      type: String,
      required: [true, "Street name is required"],
      trim: true,
    },
    tamilName: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "600001",
    },
  },
  { timestamps: true }
);

const Corporation = mongoose.model("Corporation", corporationSchema);
const Zone = mongoose.model("Zone", zoneSchema);
const Ward = mongoose.model("Ward", wardSchema);
const Locality = mongoose.model("Locality", localitySchema);
const Street = mongoose.model("Street", streetSchema);

module.exports = {
  Corporation,
  Zone,
  Ward,
  Locality,
  Street,
};
