const Inspection = require('../models/Inspection');
const Location = require('../models/Location');

const createInspection = async (req, res) => {
  try {
    const { location, criteria, notes, inspectionDate } = req.body;
    const loc = await Location.findById(location);
    if (!loc) return res.status(404).json({ message: 'Location not found' });

    const inspection = new Inspection({
      location,
      auditor: req.user._id,
      criteria,
      notes,
      inspectionDate,
    });

    // status derived from threshold after pre-save computes complianceScore
    await inspection.save();
    inspection.status = inspection.complianceScore >= loc.complianceThreshold ? 'Compliant' : 'Non-Compliant';
    await inspection.save();

    const populated = await inspection.populate([
      { path: 'location' },
      { path: 'auditor', select: 'name email role' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create inspection', error: err.message });
  }
};

const getInspections = async (req, res) => {
  try {
    const { location, status } = req.query;
    const filter = {};
    if (location) filter.location = location;
    if (status) filter.status = status;
    const inspections = await Inspection.find(filter)
      .populate('location')
      .populate('auditor', 'name email role')
      .sort({ inspectionDate: -1 });
    res.json(inspections);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inspections', error: err.message });
  }
};

const getInspectionById = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('location')
      .populate('auditor', 'name email role');
    if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
    res.json(inspection);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inspection', error: err.message });
  }
};

const updateInspection = async (req, res) => {
  try {
    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) return res.status(404).json({ message: 'Inspection not found' });

    Object.assign(inspection, req.body);
    await inspection.save(); // triggers pre-save recompute

    const loc = await Location.findById(inspection.location);
    if (loc) {
      inspection.status = inspection.complianceScore >= loc.complianceThreshold ? 'Compliant' : 'Non-Compliant';
      await inspection.save();
    }

    res.json(inspection);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update inspection', error: err.message });
  }
};

const deleteInspection = async (req, res) => {
  try {
    const inspection = await Inspection.findByIdAndDelete(req.params.id);
    if (!inspection) return res.status(404).json({ message: 'Inspection not found' });
    res.json({ message: 'Inspection deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete inspection', error: err.message });
  }
};

module.exports = {
  createInspection,
  getInspections,
  getInspectionById,
  updateInspection,
  deleteInspection,
};
