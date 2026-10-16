console.log("1 start");
require("dotenv").config();
const mongoose = require("mongoose");
console.log("2 mongoose loaded");
const initData = require("./generateData.js");
console.log("3 data loaded");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
console.log("4 models loaded");
const { geocodeLocation } = require("../utils/geocode");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function seed() {
  await mongoose.connect(process.env.ATLAS_DB_URL, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected to Atlas");

  const owner = await User.findOne();
  if (!owner) throw new Error("No user found. Sign up in the app first.");

  // Geocode each unique location only once (Nominatim allows ~1 request/sec)
  const cache = {};
  for (const l of initData.data) {
    const key = `${l.location},${l.country}`;
    if (!cache[key]) {
      cache[key] = await geocodeLocation(l.location, l.country);
      console.log("Geocoded", key);
      await sleep(1200);
    }
    l.latitude = cache[key].latitude;
    l.longitude = cache[key].longitude;
    l.owner = owner._id;
  }

  await Listing.deleteMany({});
  await Listing.insertMany(initData.data);
  console.log(`Seeded ${initData.data.length} listings, owner: ${owner.username}`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.connection.close());