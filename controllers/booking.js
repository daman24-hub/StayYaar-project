const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.showBookingForm = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    res.render("bookings/new.ejs", { listing });
};

module.exports.createBooking = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");  // ← Make sure this line exists

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    if (!listing.owner) {  // ← Add this check
        req.flash("error", "Listing owner not found.");
        return res.redirect("/listings");
    }

    if (!req.user) {
        req.flash("error", "You must be logged in to book.");
        return res.redirect("/login");
    }

    const { checkInDate, checkOutDate, numberOfGuests, specialRequests, guestPhone } = req.body.booking;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
        req.flash("error", "Invalid dates selected.");
        return res.redirect(`/bookings/new/${id}`);
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    if (nights <= 0) {
        req.flash("error", "Check-out date must be after check-in date.");
        return res.redirect(`/bookings/new/${id}`);
    }

    const totalPrice = listing.price * nights;
    const taxAmount = Math.round(totalPrice * 0.18);
    const finalPrice = totalPrice + taxAmount;

    const booking = new Booking({
        listing: listing._id,
        guest: req.user._id,
        host: listing.owner._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfNights: nights,
        pricePerNight: listing.price,
        totalPrice,
        taxAmount,
        finalPrice,
        numberOfGuests,
        specialRequests: specialRequests || "",
        guestEmail: req.user.email,
        guestPhone: guestPhone || "",
        status: "pending",
    });

    await booking.save();

    listing.bookings = listing.bookings || [];
    listing.bookings.push(booking._id);
    await listing.save();

    req.user.bookings = req.user.bookings || [];
    req.user.bookings.push(booking._id);
    await req.user.save();

    req.flash("success", "Booking request sent successfully!");
    res.redirect(`/bookings/${booking._id}`);
};

module.exports.showBookingDetails = async (req, res) => {
    const booking = await Booking.findById(req.params.bookingId)
        .populate("listing")
        .populate("guest")
        .populate("host");

    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings");
    }

    res.render("bookings/show.ejs", { booking });
};

module.exports.myBookings = async (req, res) => {
    const bookings = await Booking.find({ guest: req.user._id })
        .populate("listing")
        .sort({ createdAt: -1 });

    res.render("bookings/index.ejs", { bookings });
};

module.exports.cancelBooking = async (req, res) => {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings");
    }

    if (!booking.guest.equals(req.user._id)) {
        req.flash("error", "You are not authorized.");
        return res.redirect("/bookings");
    }

    booking.status = "cancelled";
    await booking.save();

    req.flash("success", "Booking cancelled.");
    res.redirect("/bookings");
};