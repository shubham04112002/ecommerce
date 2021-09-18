require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const logger = require("morgan");
const passport = require("passport");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const engine = require("ejs-mate");
const Category = require("./models/category");

// mongo connection establishing
const { connectDB } = require("./config/database");
connectDB();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", engine);

// admin route
const { router, admin } = require("./routes/admin");
app.use(admin.options.rootPath, router);

const db = process.env.DB_URL || "mongodb://mymongo:27017/flash-tutorial";
const store = new MongoDBStore({
  uri: db,
  databaseName: "flash-tutorial",
  collection: "session",
});
store.on("error", (error) => {
  console.log("Mongodb storee error", error);
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: { httpOnly: true, maxAge: 3 * 60 * 60 * 1000 },
};
app.use(session(sessionConfig));
app.use(flash());
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// adding usefull variables to locals so can access in any template
app.use(async (req, res, next) => {
  try {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    res.locals.currentUser = req.user;
    const categories = await Category.find({}).sort({ title: 1 }).exec();
    res.locals.categories = categories;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    next();
  } catch (error) {
    console.log("error at middleware for res.locals ", error);
    res.redirect("/");
  }
});

// breadcrumbs logic
// breadcrumbs serve as a effective navigation tool instead of navbar but it should be remembered that it is for helping not to replace navbar
const get_breadcrumbs = function (url) {
  var rtn = [{ name: "Home", url: "/" }];
  acc = ""; //accumulative url
  arr = url.substring(1).split("/");

  for (let i = 0; i < arr.length; i++) {
    acc = i !== arr.length - 1 ? acc + "/" + arr[i] : null;
    rtn[i + 1] = {
      name: arr[i].charAt(0).toUpperCase() + arr[i].slice(1),
      url: acc,
    };
  }
  return rtn;
};

app.use((req, res, next) => {
  req.breadcrumbs = get_breadcrumbs(req.originalUrl);
  next();
});

// requiring all the routes handler needed
const indexRouter = require("./routes/index");
const productsRouter = require("./routes/products");
const usersRouter = require("./routes/user");
const pagesRouter = require("./routes/pages");

app.use("/", indexRouter);
app.use("/products", productsRouter);
app.use("/user", usersRouter);
app.use("/pages", pagesRouter);

// Using http-errors to handle unknown routes
const createErrors = require("http-errors");
app.use((req, res, next) => {
  next(createErrors(404));
});

// the great error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  //   rendering the error page
  res.status(err.status || 500);
  res.render("error");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is up and running on port ${port}`);
});
