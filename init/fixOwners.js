require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

(async () => {
  await mongoose.connect(process.env.ATLAS_DB_URL, { serverSelectionTimeoutMS: 10000 });

  const owner = await User.findOne({ username: process.env.ADMIN_USERNAME }) || await User.findOne();
  if (!owner) throw new Error("No user found. Sign up first.");

  const users = await User.find({}, "_id");
  const validIds = users.map((u) => u._id);

  const result = await Listing.updateMany(
    { $or: [{ owner: { $exists: false } }, { owner: null }, { owner: { $nin: validIds } }] },
    { $set: { owner: owner._id } }
  );

  console.log(`Fixed ${result.modifiedCount} listings, new owner: ${owner.username}`);
})()
  .catch((e) => { console.error(e.message); process.exitCode = 1; })
  .finally(() => mongoose.connection.close());