const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    category: {
      type: String,
      enum: ['Academic Block', 'Hostel', 'Canteen', 'Lab', 'Washroom', 'Campus Ground', 'Office', 'Other'],
      default: 'Other',
    },
    incharge: { type: String, trim: true },
    complianceThreshold: { type: Number, default: 70 }, // % below which alerts trigger
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Location', locationSchema);
