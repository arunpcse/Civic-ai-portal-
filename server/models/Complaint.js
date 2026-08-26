const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    originalDescription: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    // ── Location Hierarchy ──
    corporationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Corporation",
      default: null,
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Zone",
      default: null,
    },
    wardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ward",
      default: null,
    },
    locality: {
      type: String,
      default: "",
      trim: true,
    },
    street: {
      type: String,
      default: "",
      trim: true,
    },
    specificLocation: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      latitude: {
        type: Number,
        default: 13.0827,
      },
      longitude: {
        type: Number,
        default: 80.2707,
      },
      address: {
        type: String,
        required: [true, "Address is required"],
      },
      ward: {
        type: String,
        default: "",
      },
    },
    citizenCategory: {
      type: String,
      enum: [
        "Pothole / Road Damage",
        "Garbage",
        "Water Leakage",
        "Drainage Problem",
        "Streetlight Problem",
      ],
      default: "Pothole / Road Damage",
    },
    aiCategory: {
      type: String,
      default: "Pending AI Processing",
    },
    aiConfidence: {
      type: Number,
      default: 0,
    },
    aiDepartment: {
      type: String,
      default: "Pending AI Classification",
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    priorityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    duplicate: {
      type: Boolean,
      default: false,
    },
    parentComplaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
    },
    duplicateCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "Submitted",
        "AI Processing",
        "Verified",
        "Assigned",
        "In Progress",
        "Resolution Submitted",
        "Verification",
        "Resolved",
        "Citizen Confirmed",
        "Closed",
        "Rejected",
        "Duplicate",
        "Reopened",
        "Escalated",
      ],
      default: "Submitted",
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    beforeImage: {
      type: String,
      default: "",
    },
    afterImage: {
      type: String,
      default: "",
    },
    resolutionRemarks: {
      type: String,
      default: "",
    },
    citizenConfirmation: {
      isConfirmed: {
        type: Boolean,
        default: false,
      },
      feedback: {
        type: String,
        default: "",
      },
      rating: {
        type: Number,
        default: 0,
      },
      confirmedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Complaint", complaintSchema);