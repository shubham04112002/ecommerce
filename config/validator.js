const { check, validationResult } = require("express-validator");

const userSignUpValidationRules = () => {
  return [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Email is required").not().isEmpty().isEmail(),
    check("password", "Please Enter a password with 4 or more character")
      .not()
      .isEmpty()
      .isLength({ min: 4, max: 10 }),
  ];
};

const userSignInValidationRules = () => {
  return [
    check("email", "Invalid Email").notEmpty().isEmail(),
    check("password", "Inavlid Password")
      .notEmpty()
      .isLength({ min: 4, max: 10 }),
  ];
};

const userContactUsValidationRules = () => {
  return [
    check("name", "Please Enter A Name").notEmpty(),
    check("email", "Please Enter a valid email address").notEmpty().isEmail(),
    check("message", "Enter message with at least 10 words")
      .notEmpty()
      .isLength({ min: 10 }),
  ];
};

const validateSignUp = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = [];
    // errors is an array of objects and each objects carry a bunch of properties , and one of them is "msg"
    errors.array().forEach((error) => {
      messages.push(error.msg);
    });
    req.flash("error", messages);
    return res.redirect("/user/signup");
  }
  next();
};

const validateSignIn = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = [];
    errors.array().forEach((error) => {
      messages.push(error.msg);
    });
    req.flash("error", messages);
    return res.redirect("/user/signin");
  }
  next();
};

const validateContactUs = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = [];
    errors.array().forEach((error) => {
      messages.push(error.msg);
    });
    req.flash("error", messages);
    return res.redirect("/pages/contact-us");
  }
  next();
};

module.exports = {
  userSignUpValidationRules,
  userSignInValidationRules,
  userContactUsValidationRules,
  validateSignIn,
  validateSignUp,
  validateContactUs,
};
