require("dotenv").config();
const express = require("express");
const router = express.Router();
const csrf = require("csurf");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const Product = require("../models/product");
const Cart = require("../models/cart");
const Order = require("../models/order");
const { isLoggedIn, isNotLoggedIn } = require("../middleware");

const csrfProtection = csrf();
router.use(csrfProtection);

// create products array to store the info of each product in the cart

async function productFromCart(cart) {
  let products = []; //array of objects
  for (const item of cart.items) {
    let foundProduct = (
      await Product.findById(item.productId).populate("category")
    ).toObject();
    foundProduct["qty"] = item.qty;
    foundProduct["totalPrice"] = item.price;
    products.push(foundProduct);
  }
  return products;
}

// Get Route to render home page
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({})
      .sort("-createdAt")
      .populate("category");
    res.render("shop/home", { pageName: "Home", products });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// Get Route to add a product to shopping cart when add to shopping cart button is pressed

router.get("/add-to-cart/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    // getting the right cart either from database or from session or maybe just create an empty cart
    let user_cart;
    if (req.user) {
      user_cart = await Cart.findOne({ user: req.user._id });
    }
    let cart;
    if (
      (req.user && !user_cart && req.session.cart) ||
      (!req.user && req.session.cart)
    ) {
      cart = await new Cart(req.session.cart);
    } else if (!req.user || !user_cart) {
      cart = new Cart({});
    } else {
      cart = user_cart;
    }

    // add the product to the cart
    const product = await Product.findById(productId);
    const itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // if products exist in the cart , update the quantity
      cart.items[itemIndex].qty++;
      cart.items[itemIndex].price = cart.items[itemIndex].qty * product.price;
      cart.totalQty++;
      cart.totalCost += product.price;
    } else {
      // if product doesnot exist in cart ,then find it in the database to retrieve its price and add new items to it
      cart.items.push({
        productId,
        qty: 1,
        price: product.price,
        title: product.title,
        productCode: product.productCode,
      });
      cart.totalQty++;
      cart.totalCost += product.price;
    }

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      cart.user = req.user._id;
      await cart.save();
    }
    req.session.cart = cart;
    req.flash("success", "Item added to the shopping cart");
    res.redirect(req.headers.referer);
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// Get Route to see all the items in our shopping cart

router.get("/shopping-cart", async (req, res) => {
  try {
    // finding the cart ,whether in session or in database ,based on the user state
    let cart_user;
    if (req.user) {
      cart_user = await Cart.findOne({ user: req.user._id });
    }
    // if user is signed in and has the cart then load user's cart from the database
    if (req.user && cart_user) {
      req.session.cart = cart_user;
      return res.render("shop/shopping-cart", {
        cart: cart_user,
        pageName: "Shopping Cart",
        products: await productFromCart(cart_user),
      });
    }

    // if there is no cart in the session and user is not logged in then the cart is empty

    if (!req.session.cart) {
      return res.render("shop/shopping-cart", {
        cart: null,
        pageName: "Shopping Cart",
        products: null,
      });
    }

    // otherwise , load the session's cart
    return res.render("shop/shopping-cart", {
      cart: req.session.cart,
      pageName: "Shopping Cart",
      products: await productFromCart(req.session.cart),
    });
  } catch (error) {
    console.log(error);
    res.redirect(req.headers.referer);
  }
});

// Get route to reduce one item from the cart in the shopping cart page
router.get("/reduce/:id", async (req, res) => {
  // if a user is logged in reduce from the users cart and then save it else
  // reduce from the session cart
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }
    // find the item with productId
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // find the product to find its price
      const product = await Product.findById(productId);
      // if product is found , reduce its quantity
      cart.items[itemIndex].qty--;
      cart.items[itemIndex].price -= product.price;
      cart.totalQty--;
      cart.totalCost -= product.price;
      // if the items quantity reaches zero remove it from the cart
      if (cart.items[itemIndex].qty <= 0) {
        await cart.items.remove({ _id: cart.items[itemIndex]._id });
      }
      req.session.cart = cart;
      // save the cart only if the user is logged in
      if (req.user) {
        await cart.save();
      }
      // delete cart if quantity is zero
      if (cart.totalQty <= 0) {
        req.session.cart = null;
        await Cart.findByIdAndRemove(cart._id);
      }
    }
    return res.redirect(req.headers.referer);
  } catch (error) {
    console.log(error);
    res.redirect(req.headers.referer);
  }
});

// Get route to remove all instance of the particular product from the cart
router.get("/remove/:id", async (req, res) => {
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }
    // find the item with the id productid
    let itemIndex = cart.items.findIndex((p) => p.productId == productId);
    if (itemIndex > -1) {
      // find the product to find its price
      cart.totalQty -= cart.items[itemIndex].qty;
      cart.totalCost -= cart.items[itemIndex].price;
      await cart.items.remove({ _id: cart.items[itemIndex]._id });
    }
    req.session.cart = cart;
    // save the cart only if user is logged in
    if (req.user) {
      await cart.save();
    }
    // delete cart if qty is zero
    if (cart.totalQty <= 0) {
      req.session.cart = null;
      await Cart.findByIdAndRemove(cart._id);
    }
    res.redirect(req.headers.referer);
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// Get route for the checkout form with csrf token to prevent csrf attack
router.get("/checkout", isLoggedIn, async (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/");
  }
  // load the cart with the session's cart's id from the database
  cart = await Cart.findById(req.session.cart._id);
  res.render("shop/checkout", {
    total: cart.totalCost,
    csrfToken: req.csrfToken(),
    pageName: "Checkout",
  });
});

// To create a payment-intent as soon as the payment page is loaded.A payment intent track the payment lifecycle,keeping track of any failed payment attempts and ensuring the customer is only charged once.Return the payment intent's client secret in response to finish the payment on the client
router.post("/create-payment-intent", isLoggedIn, async (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/");
  }
  const cart = await Cart.findById(req.session.cart._id);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: cart.totalCost,
    currency: "inr",
  });
  res.send({ clientSecret: paymentIntent.client_secret });
});

// Post request to handle checkout logic and payment using stripe
router.post("/checkout", isLoggedIn, async (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  const cart = await Cart.findById(req.session.cart._id);
  console.log(req.body);
  console.log(
    "address",
    req.body.address,
    "paymentIntent",
    req.body.paymentIntentId
  );
  const order = new Order({
    user: req.user,
    cart: {
      totalQty: cart.totalQty,
      totalCost: cart.totalCost,
      items: cart.items,
    },
    address: req.body.address,
    paymentId: req.body.paymentIntentId,
  });
  order.save(async (err, newOrder) => {
    if (err) {
      console.log(err);
      return res.redirect("/shopping-cart");
    }
    await cart.save();
    await Cart.findByIdAndDelete(cart._id);
    req.flash("success", "Successfully Purchased");
    req.session.cart = null;
    res.redirect("/user/profile");
  });
});

module.exports = router;
