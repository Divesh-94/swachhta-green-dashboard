const Location = require('../models/Location');

const createLocation = async (req, res) => {
  try {
    const location = await Location.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(location);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create location', error: err.message });
  }
};

const getLocations = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    const locations = await Location.find(filter).sort({ createdAt: -1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch locations', error: err.message });
  }
};

const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch location', error: err.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json(location);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update location', error: err.message });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location not found' });
    res.json({ message: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete location', error: err.message });
  }
};

module.exports = { createLocation, getLocations, getLocationById, updateLocation, deleteLocation };
