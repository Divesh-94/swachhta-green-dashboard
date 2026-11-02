const mongoose = require('mongoose');

const criterionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Waste Segregation"
    maxScore: { type: Number, required: true, default: 10 },
    obtainedScore: { type: Number, required: true, default: 0 },
    remarks: { type: String, trim: true },
  },
  { _id: false }
);

const inspectionSchema = new mongoose.Schema(
  {
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    auditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inspectionDate: { type: Date, default: Date.now },
    criteria: {
      type: [criterionSchema],
      default: () => [
        { name: 'Cleanliness & Sanitation', maxScore: 10, obtainedScore: 0 },
        { name: 'Waste Segregation & Disposal', maxScore: 10, obtainedScore: 0 },
        { name: 'Water & Energy Conservation', maxScore: 10, obtainedScore: 0 },
        { name: 'Green Cover / Plantation Upkeep', maxScore: 10, obtainedScore: 0 },
        { name: 'Signage & Awareness Compliance', maxScore: 10, obtainedScore: 0 },
      ],
    },
    complianceScore: { type: Number, default: 0 }, // percentage, auto-computed
    status: {
      type: String,
      enum: ['Compliant', 'Non-Compliant'],
      default: 'Compliant',
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

inspectionSchema.pre('save', function (next) {
  const totalMax = this.criteria.reduce((sum, c) => sum + c.maxScore, 0);
  const totalObtained = this.criteria.reduce((sum, c) => sum + c.obtainedScore, 0);
  this.complianceScore = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
  next();
});

module.exports = mongoose.model('Inspection', inspectionSchema);
