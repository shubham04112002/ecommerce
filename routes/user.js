const express = require("express");
const router = express.Router();
const csrf = require("csurf");
const passport = require("passport");
const Order = require("../models/order");
const Cart = require("../models/cart");
const { isNotLoggedIn, isLoggedIn } = require("../middleware");
const {
  userContactUsValidationRules,
  userSignInValidationRules,
  userSignUpValidationRules,
  validateContactUs,
  validateSignUp,
  validateSignIn,
} = require("../config/validator");
const csrfProtection = csrf();
router.use(csrfProtection);

// Get route to display the signup form with csrf token
router.get("/signup", isNotLoggedIn, (req, res) => {
  res.render("user/signup", {
    csrfToken: req.csrfToken(),
    pageName: "Sign Up",
  });
});

// Post route to handle signup logic
router.post(
  "/signup",
  [
    isNotLoggedIn,
    userSignUpValidationRules(),
    validateSignUp,
    passport.authenticate("local.signup", {
      successRedirect: "/user/profile",
      failureRedirect: "/user/signup",
      failureFlash: true,
    }),
  ],
  async (req, res) => {
    try {
      // if there is a cart session save it to the user database
      if (req.session.cart) {
        const cart = await new Cart(req.session.cart);
        cart.user = req.user._id;
        await cart.save();
      }
      // redirect to the previous url
      if (req.session.oldUrl) {
        const oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        return res.redirect(oldUrl);
      } else {
        res.redirect("/user/profile");
      }
    } catch (error) {
      console.log(error);
      req.flash("error", error.message);
      return res.redirect("/");
    }
  }
);

// Get route to display the sign in form with csrf token
router.get("/signin", isNotLoggedIn, async (req, res) => {
  res.render("user/signin", {
    pageName: "Sign In",
    csrfToken: req.csrfToken(),
  });
});

// Post route to handle signin logic
router.post(
  "/signin",
  [
    isNotLoggedIn,
    userSignInValidationRules(),
    validateSignIn,
    passport.authenticate("local.signin", {
      failureRedirect: "/user/signin",
      failureFlash: true,
    }),
  ],
  async (req, res) => {
    try {
      // cart logic when user logs in
      let cart = await Cart.findOne({ user: req.user._id });
      // if there is a cart session and user has no cart,save it to the user's cart in database
      if (req.session.cart && !cart) {
        const cart = await new Cart(req.session.cart);
        cart.user = req.user._id;
        await cart.save();
      }
      // if user has a cart in the database load it into the session
      if (cart) {
        req.session.cart = cart;
      }
      // redirect to the old url before signin
      if (req.session.oldUrl) {
        const oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        return res.redirect(oldUrl);
      } else {
        res.redirect("/user/profile");
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "/");
      res.redirect("/");
    }
  }
);

// Get route to display user's profile
router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    // find all orders of this user
    const allOrders = await Order.find({ user: req.user });
    res.render("user/profile", {
      orders: allOrders,
      pageName: "User Profile",
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});

// Get route to handle logout
router.get("/logout", isLoggedIn, (req, res) => {
  req.logOut();
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
