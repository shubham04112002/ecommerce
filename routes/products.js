const express = require("express");
const router = express.Router();
const moment = require("moment");
const Product = require("../models/product");
const Category = require("../models/category");

// Get route to display all products
router.get("/", async (req, res) => {
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  try {
    const products = await Product.find({})
      .sort("-createdAt")
      .skip(page * perPage - perPage)
      .limit(8)
      .populate("category");
    const count = await Product.countDocuments();
    res.render("shop/index", {
      pageName: "All Products",
      products,
      current: page,
      breadcrumbs: null,
      home: "/products/?",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// Get route for search box
router.get("/search", async (req, res) => {
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;

  try {
    const products = await Product.find({
      title: { $regex: req.query.search, $options: "i" },
    })
      .sort("-createdAt")
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populate("category")
      .exec();

    const count = await Product.countDocuments({
      title: { $regex: req.query.search, $options: "i" },
    });

    res.render("shop/index", {
      pageName: "Search Results",
      products,
      current: page,
      breadcrumbs: null,
      pages: Math.ceil(count / perPage),
      home: "/products/search?search=" + req.query.search + "&",
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// Get route to get a certain category by its slug (this is used for the categories navbar)
router.get("/:slug", async (req, res) => {
  const perPage = 8;
  const page = parseInt(req.query.page) || 1;
  try {
    const foundCategory = await Category.findOne({ slug: req.params.slug });
    const allProducts = await Product.find({ category: foundCategory._id })
      .sort("-createdAt")
      .skip(perPage * (page - 1))
      .limit(perPage)
      .populate("category");

    const count = await Product.countDocuments({ category: foundCategory._id });
    res.render("shop/index", {
      pageName: foundCategory.title,
      currentCategory: foundCategory,
      products: allProducts,
      image: allProducts[0].imagePath,
      current: page,
      breadcrumbs: req.breadcrumbs,
      pages: Math.ceil(count / perPage),
      home: "/products/" + req.params.slug.toString() + "/?",
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// Get route to display certain product  by its id
router.get("/:slug/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    res.render("shop/product", {
      pageName: product.title,
      product,
      moment,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});
module.exports = router;
