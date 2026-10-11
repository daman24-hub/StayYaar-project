const mongoose = require("mongoose");
const { default: passportLocalMongoose } = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        default: ""
    },
    bookings: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Booking" 
    }],
    hostedListings: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Listing" 
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
