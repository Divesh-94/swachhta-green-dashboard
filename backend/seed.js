// Run with: npm run seed
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Location = require('./models/Location');
const Inspection = require('./models/Inspection');
const Violation = require('./models/Violation');

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Location.deleteMany({}),
    Inspection.deleteMany({}),
    Violation.deleteMany({}),
  ]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
  });

  const auditor = await User.create({
    name: 'Nagamani Segalla',
    email: 'auditor@college.edu',
    password: 'auditor123',
    role: 'auditor',
  });

  const locations = await Location.insertMany([
    { name: 'CSE Academic Block', department: 'CSE', category: 'Academic Block', incharge: 'Dr. Kumar', complianceThreshold: 75, createdBy: admin._id },
    { name: 'Boys Hostel Block A', department: 'Hostel', category: 'Hostel', incharge: 'Warden Raj', complianceThreshold: 70, createdBy: admin._id },
    { name: 'Main Canteen', department: 'Admin', category: 'Canteen', incharge: 'Mr. Suresh', complianceThreshold: 80, createdBy: admin._id },
    { name: 'Central Library', department: 'Admin', category: 'Academic Block', incharge: 'Ms. Priya', complianceThreshold: 75, createdBy: admin._id },
  ]);

  const inspection1 = new Inspection({
    location: locations[0]._id,
    auditor: auditor._id,
    criteria: [
      { name: 'Cleanliness & Sanitation', maxScore: 10, obtainedScore: 8 },
      { name: 'Waste Segregation & Disposal', maxScore: 10, obtainedScore: 6 },
      { name: 'Water & Energy Conservation', maxScore: 10, obtainedScore: 7 },
      { name: 'Green Cover / Plantation Upkeep', maxScore: 10, obtainedScore: 9 },
      { name: 'Signage & Awareness Compliance', maxScore: 10, obtainedScore: 8 },
    ],
    notes: 'Overall good condition, minor waste segregation issues near canteen exit.',
  });
  await inspection1.save();
  inspection1.status = inspection1.complianceScore >= locations[0].complianceThreshold ? 'Compliant' : 'Non-Compliant';
  await inspection1.save();

  const inspection2 = new Inspection({
    location: locations[1]._id,
    auditor: auditor._id,
    criteria: [
      { name: 'Cleanliness & Sanitation', maxScore: 10, obtainedScore: 5 },
      { name: 'Waste Segregation & Disposal', maxScore: 10, obtainedScore: 4 },
      { name: 'Water & Energy Conservation', maxScore: 10, obtainedScore: 6 },
      { name: 'Green Cover / Plantation Upkeep', maxScore: 10, obtainedScore: 5 },
      { name: 'Signage & Awareness Compliance', maxScore: 10, obtainedScore: 4 },
    ],
    notes: 'Below threshold - washroom cleanliness and waste bins overflowing.',
  });
  await inspection2.save();
  inspection2.status = inspection2.complianceScore >= locations[1].complianceThreshold ? 'Compliant' : 'Non-Compliant';
  await inspection2.save();

  await Violation.insertMany([
    {
      location: locations[1]._id,
      inspection: inspection2._id,
      reportedBy: auditor._id,
      category: 'Waste Management',
      description: 'Overflowing waste bins in hostel corridor not cleared for 2 days.',
      severity: 'High',
      status: 'Open',
    },
    {
      location: locations[2]._id,
      reportedBy: auditor._id,
      category: 'Water Wastage',
      description: 'Leaking tap in canteen wash area running continuously.',
      severity: 'Medium',
      status: 'In Progress',
      correctiveAction: 'Plumber assigned, repair scheduled.',
    },
  ]);

  console.log('Seed data inserted successfully.');
  console.log('Login as admin: admin@college.edu / admin123');
  console.log('Login as auditor: auditor@college.edu / auditor123');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
