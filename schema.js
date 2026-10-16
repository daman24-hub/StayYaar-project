const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().min(0).required(),
        image: Joi.string().allow("", null),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required(),
    }).required(),
});

module.exports.bookingSchema = Joi.object({
    booking: Joi.object({
        checkInDate: Joi.date().required(),
        checkOutDate: Joi.date().greater(Joi.ref("checkInDate")).required(),
        numberOfGuests: Joi.number().min(1).required(),
        specialRequests: Joi.string().allow("").optional(),
        guestPhone: Joi.string().allow("").optional(),
    }).required(),
});