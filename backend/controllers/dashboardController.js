const Location = require('../models/Location');
const Inspection = require('../models/Inspection');
const Violation = require('../models/Violation');

// @route GET /api/dashboard/summary
const getSummary = async (req, res) => {
  try {
    const totalLocations = await Location.countDocuments();
    const totalInspections = await Inspection.countDocuments();
    const openViolations = await Violation.countDocuments({ status: { $ne: 'Resolved' } });

    const avgAgg = await Inspection.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$complianceScore' } } },
    ]);
    const avgComplianceScore = avgAgg.length ? Math.round(avgAgg[0].avgScore) : 0;

    // Non-compliant locations = latest inspection per location below threshold
    const latestPerLocation = await Inspection.aggregate([
      { $sort: { inspectionDate: -1 } },
      {
        $group: {
          _id: '$location',
          complianceScore: { $first: '$complianceScore' },
          status: { $first: '$status' },
          inspectionDate: { $first: '$inspectionDate' },
        },
      },
    ]);

    const locations = await Location.find();
    const locationMap = Object.fromEntries(locations.map((l) => [l._id.toString(), l]));

    const alerts = latestPerLocation
      .filter((item) => {
        const loc = locationMap[item._id?.toString()];
        return loc && item.complianceScore < loc.complianceThreshold;
      })
      .map((item) => ({
        location: locationMap[item._id.toString()]?.name,
        locationId: item._id,
        complianceScore: item.complianceScore,
        threshold: locationMap[item._id.toString()]?.complianceThreshold,
        inspectionDate: item.inspectionDate,
      }));

    const violationsByCategory = await Violation.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const complianceTrend = await Inspection.aggregate([
      { $sort: { inspectionDate: 1 } },
      {
        $project: {
          inspectionDate: 1,
          complianceScore: 1,
        },
      },
      { $limit: 50 },
    ]);

    res.json({
      totalLocations,
      totalInspections,
      openViolations,
      avgComplianceScore,
      alerts,
      violationsByCategory,
      complianceTrend,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to build dashboard summary', error: err.message });
  }
};

module.exports = { getSummary };
