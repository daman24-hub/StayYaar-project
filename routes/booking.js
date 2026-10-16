const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateBooking } = require("../utils/middleware.js");
const bookingController = require("../controllers/booking.js");

// All routes require login
router.get("/new/:id", isLoggedIn, wrapAsync(bookingController.showBookingForm));
router.post("/:id", isLoggedIn, validateBooking, wrapAsync(bookingController.createBooking));
router.get("/", isLoggedIn, wrapAsync(bookingController.myBookings));
router.get("/:bookingId", isLoggedIn, wrapAsync(bookingController.showBookingDetails));
router.patch("/:bookingId/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;