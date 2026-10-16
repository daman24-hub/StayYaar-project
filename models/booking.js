const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    guest: { type: Schema.Types.ObjectId, ref: "User", required: true },
    host: { type: Schema.Types.ObjectId, ref: "User", required: true },

    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    numberOfNights: { type: Number, required: true },

    pricePerNight: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true },

    numberOfGuests: { type: Number, required: true, min: 1 },
    specialRequests: { type: String, default: "" },

    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending"
    },

    guestEmail: { type: String, required: true },
    guestPhone: { type: String, default: "" },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

bookingSchema.pre("save", function (next) {
    if (this.checkInDate && this.checkOutDate) {
        const oneDay = 24 * 60 * 60 * 1000;
        this.numberOfNights = Math.ceil((this.checkOutDate - this.checkInDate) / oneDay);
        if (this.numberOfNights <= 0) {
            throw new Error("Check-out date must be after check-in date");
        }
    }

    if (this.pricePerNight && this.numberOfNights) {
        this.totalPrice = this.pricePerNight * this.numberOfNights;
        this.taxAmount = Math.round(this.totalPrice * 0.18);
        this.finalPrice = this.totalPrice + this.taxAmount;
    }

    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model("Booking", bookingSchema);