const mongoose = require("mongoose");
const initData = require("./generateData.js");
const Listing = require("../models/listing.js");
const { geocodeLocation } = require("../utils/geocode");

const Mongo_URL = "mongodb://127.0.0.1:27017/ZENVORA";

main()
  .then(async () => {
    console.log("connected to DB");
    await initDB();
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(Mongo_URL);
}

const initDB = async () => {
  await Listing.deleteMany({}); // to clean if data is already there
  initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "000000000000000000000000", // placeholder ObjectId
    }));

  for (let listing of initData.data) {
  try {
    const coords = await geocodeLocation(
      listing.location,
      listing.country
    );

    listing.latitude = coords.latitude;
    listing.longitude = coords.longitude;
  } catch (err) {
    listing.latitude = 20.5937;
    listing.longitude = 78.9629;
  }

  await new Promise(resolve =>
    setTimeout(resolve, 1200)
  );
}


await Listing.insertMany(initData.data);
  console.log("Data initialized with coordinates");
};

