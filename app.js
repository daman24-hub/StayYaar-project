console.log("✅ app.js is loading...");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


console.log("ENV CHECK:", {
    NODE_ENV: process.env.NODE_ENV,
    SECRET: !!process.env.SECRET,
    ATLAS_DB_URL: !!process.env.ATLAS_DB_URL,
});

console.log("📦 Loading dependencies...");
const express = require("express");
console.log("✓ express loaded");

const mongoose = require("mongoose");
console.log("✓ mongoose loaded");

const path = require("path");
console.log("✓ path loaded");

const methodOverride = require("method-override");
console.log("✓ methodOverride loaded");

const ejsMate = require("ejs-mate");
console.log("✓ ejsMate loaded");

const ExpressError = require("./utils/ExpressError.js");
console.log("✓ ExpressError loaded");

const session = require("express-session");
console.log("✓ session loaded");

const MongoStore = require("connect-mongo").default;
console.log("✓ MongoStore loaded");

const flash = require("connect-flash");
console.log("✓ flash loaded");

const passport = require("passport");
console.log("✓ passport loaded");

const LocalStrategy = require("passport-local");
console.log("✓ LocalStrategy loaded");

const User = require("./models/user.js");
console.log("✓ User model loaded");

console.log("📂 Loading routers...");
const listingRouter = require("./routes/listing.js");
console.log("✓ listingRouter loaded");

const reviewRouter = require("./routes/review.js");
console.log("✓ reviewRouter loaded");

const userRouter = require("./routes/user.js");
console.log("✓ userRouter loaded");

const bookingRouter = require("./routes/booking.js");
console.log("✓ bookingRouter loaded");

console.log("🚀 All imports complete!");

// Setting for project requirements.
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const cloudDatabaseUrl = process.env.ATLAS_DB_URL;

// Database connectivity setup
console.log("🔄 Attempting MongoDB connection...");

mongoose.connect(cloudDatabaseUrl, { serverSelectionTimeoutMS: 10000 })
    .then(() => {
        console.log("✅ Database connected successfully!");
        startServer();
    })
    .catch((err) => {
        console.error(" Database connection failed:", err.message);
        process.exit(1);
    });

function startServer() {
    const store = MongoStore.create({
        mongoUrl: cloudDatabaseUrl,
        crypto: {
            secret: process.env.SECRET || "fallbacksecret",
        },
        touchAfter: 24 * 3600,
        stringify: false,
    });

    store.on("error", (error) => {
        console.log("ERROR in MONGO SESSION STORE!", error);
        console.error(error);
        console.error("MongoStore Error:", error);

    });

    const sessionOptions = {
        store: store,
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            maxAge:7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        },
    };

    app.use(session(sessionOptions));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currentUser = req.user;
        next();
    });

    // Home Route
    app.get("/", (req, res) => {
        if (req.isAuthenticated()) {
            return res.redirect("/listings");
        }
        res.redirect("/login");
    });

    // Express Routers
    app.use("/listings", listingRouter);
    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/bookings", bookingRouter);
    app.use("/", userRouter);

    // Footer Static Pages
    app.get("/privacy", (req, res) => res.render("static/privacy.ejs"));
    app.get("/terms", (req, res) => res.render("static/terms.ejs"));
    app.get("/sitemap", (req, res) => res.render("static/sitemap.ejs"));
    app.get("/company-details", (req, res) => res.render("static/company.ejs"));

    // Error Middlewares
    app.use((req, res, next) => {
        next(new ExpressError(404, "Page Not Found"));
    });

    app.use((err, req, res, next) => {
        console.log("ERROR STACK:", err.stack);
        let { statusCode = 500, message = "Something Went Wrong!" } = err;
        res.status(statusCode).render("error.ejs", { message });
    });

    /* Server setup */
    app.listen(8080, () => {
        console.log(" Server is running on http://localhost:8080");
    });
  


}