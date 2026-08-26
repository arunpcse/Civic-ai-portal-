const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Department = require("../models/Department");

const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. Top-level summary counts
    const [total, resolved, duplicate, pending] = await Promise.all([
      Complaint.countDocuments({}),
      Complaint.countDocuments({ status: "Resolved" }),
      Complaint.countDocuments({ duplicate: true }),
      Complaint.countDocuments({ status: { $nin: ["Resolved", "Closed", "Rejected"] } }),
    ]);

    // 2. Aggregation by AI Category (for Bar Chart)
    const byCategory = await Complaint.aggregate([
      { $match: { aiCategory: { $exists: true, $ne: null } } },
      { $group: { _id: "$aiCategory", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 3. Aggregation by Status (for Pie Chart)
    const byStatus = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 4. Aggregation by Department (for Bar Chart)
    const byDepartment = await Complaint.aggregate([
      {
        $match: {
          assignedDepartment: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$assignedDepartment",
          count: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: "$department.departmentName",
          count: 1,
          resolved: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 5. Complaints over last 7 days (for timeline trend)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);
      const count = await Complaint.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
      });
      last7Days.push({
        date: date.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        count,
      });
    }

    // 6. Map data: complaints with locations and severity
    const mapData = await Complaint.find(
      { "location.latitude": { $ne: 0 } },
      {
        complaintId: 1,
        title: 1,
        aiCategory: 1,
        severity: 1,
        status: 1,
        location: 1,
        priorityScore: 1,
      }
    ).limit(500);

    // 7. Resolution rate
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // 8. Average priority score
    const priorityAgg = await Complaint.aggregate([
      { $match: { priorityScore: { $exists: true, $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: "$priorityScore" } } },
    ]);
    const avgPriority = priorityAgg.length > 0 ? Math.round(priorityAgg[0].avg) : 0;

    return res.status(200).json({
      success: true,
      analytics: {
        summary: {
          total,
          resolved,
          pending,
          duplicate,
          resolutionRate,
          avgPriority,
        },
        byCategory: byCategory.map((c) => ({ name: c._id || "Unknown", value: c.count })),
        byStatus: byStatus.map((s) => ({ name: s._id || "Unknown", value: s.count })),
        byDepartment: byDepartment.map((d) => ({
          name: d.name || "Unassigned",
          total: d.count,
          resolved: d.resolved,
        })),
        trend: last7Days,
        mapData,
      },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardAnalytics };
