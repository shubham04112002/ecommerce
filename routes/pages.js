const express = require("express");
const csrf = require("csurf");
const nodemailer = require("nodemailer");
const router = express.Router();
const {
  validateContactUs,
  userContactUsValidationRules,
} = require("../config/validator");
const csrfProtection = csrf();
router.use(csrfProtection);

// Get route to display about us page
router.get("/about-us", (req, res) => {
  res.render("pages/about-us", {
    pageName: "About Us",
  });
});

// Get route to display shipping policy page
router.get("/shipping-policy", (req, res) => {
  res.render("pages/shipping-policy", {
    pageName: "Shipping Policy",
  });
});

// Get route to display the carrier page
router.get("/careers", (req, res) => {
  res.render("pages/careers", {
    pageName: "Careers",
  });
});

// Get route to display contact us page and form with csrf token
router.get("/contact-us", (req, res) => {
  res.render("pages/contact-us", {
    pageName: "Contact Us",
    csrfToken: req.csrfToken(),
  });
});

// post route to handle contact us form logic through nodemailer
router.post(
  "/contact-us",
  [userContactUsValidationRules(), validateContactUs],
  async (req, res) => {
    try {
      // only use because I don't have a real mail account for testing

      let testAccount = await nodemailer.createTestAccount();

      // instantiating an smtp server
      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        // email and password of the company to access the smtp server
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      // email options
      const mailOpts = {
        from: req.body.email,
        to: process.env.EMAIL,
        subject: `Enquiry from ${req.body.name}`,
        html: `
          <div>
            <h2>Client's Name : ${req.body.name}</h2>
            <h3>Client's Email : ${req.body.email}</h3>
          </div>
          <h3>Client's message: </h3>
          <div>${req.body.message}</div>
        `,
      };

      // send the email
      const response = await transporter.sendMail(mailOpts);
      console.log(response);
      if (response.error) {
        req.flash(
          "error",
          "An error occured please check your internet connection"
        );
        return res.redirect("/pages/contact-us");
      } else {
        req.flash(
          "success",
          "Email sent successfully! Thanks for your inquiry"
        );
        return res.redirect("/pages/contact-us");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/pages/contact-us");
    }
  }
);

module.exports = router;
