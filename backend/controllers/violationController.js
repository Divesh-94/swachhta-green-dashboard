const Violation = require('../models/Violation');

const createViolation = async (req, res) => {
  try {
    const violation = await Violation.create({ ...req.body, reportedBy: req.user._id });
    const populated = await violation.populate([
      { path: 'location' },
      { path: 'reportedBy', select: 'name email role' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create violation', error: err.message });
  }
};

const getViolations = async (req, res) => {
  try {
    const { status, severity, location } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (location) filter.location = location;
    const violations = await Violation.find(filter)
      .populate('location')
      .populate('reportedBy', 'name email role')
      .sort({ createdAt: -1 });
    res.json(violations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch violations', error: err.message });
  }
};

const updateViolation = async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.status === 'Resolved') update.resolvedAt = new Date();
    const violation = await Violation.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate('location')
      .populate('reportedBy', 'name email role');
    if (!violation) return res.status(404).json({ message: 'Violation not found' });
    res.json(violation);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update violation', error: err.message });
  }
};

const deleteViolation = async (req, res) => {
  try {
    const violation = await Violation.findByIdAndDelete(req.params.id);
    if (!violation) return res.status(404).json({ message: 'Violation not found' });
    res.json({ message: 'Violation deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete violation', error: err.message });
  }
};

module.exports = { createViolation, getViolations, updateViolation, deleteViolation };
