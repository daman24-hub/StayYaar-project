const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../utils/middleware.js");
const reviewController = require("../controllers/review.js");

// Add review: /listings/:id/reviews
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.addReview));

// Delete review: /listings/:id/reviews/:reviewId
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports = router;