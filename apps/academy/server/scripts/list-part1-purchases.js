// One-off: list paid Purchase records for the Clinical Intake Part 1 material,
// so we can see who/what is currently unlocking it before deciding what to delete.
// Run with: node scripts/list-part1-purchases.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const CourseMaterial = require('../models/CourseMaterial');
const Purchase = require('../models/Purchase');

async function main() {
  await connectDB();

  const material = await CourseMaterial.findOne({ courseGroup: 'clinical-intake', order: 1 });
  if (!material) {
    console.log('No Part 1 material found for courseGroup "clinical-intake".');
    await mongoose.disconnect();
    return;
  }
  console.log(`Part 1 material: ${material.title} (_id: ${material._id})`);

  const purchases = await Purchase.find({ materialId: material._id, status: 'paid' }).sort({ paidAt: -1 });
  console.log(`Found ${purchases.length} paid purchase(s):`);
  purchases.forEach(p => {
    console.log(`- _id=${p._id} identity=${p.identity} name=${p.name} email=${p.email} amount=${p.amount} paidAt=${p.paidAt}`);
  });

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
