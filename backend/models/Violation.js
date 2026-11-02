const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema(
  {
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    inspection: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['Sanitation', 'Waste Management', 'Water Wastage', 'Energy Wastage', 'Green Cover Damage', 'Other'],
      default: 'Other',
    },
    description: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    correctiveAction: { type: String, trim: true },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Violation', violationSchema);
