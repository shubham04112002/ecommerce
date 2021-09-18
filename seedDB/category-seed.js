const Category = require("../models/category");
const mongoose = require("mongoose");
const { connectDB } = require("../config/database");
console.log(
  "*************************************CATEGORY SEED*********************************"
);
connectDB();

async function seedDB() {
  await Category.deleteMany();
  async function seedCategory(titleString) {
    // category schema only needs a title and the slug will be created automatically
    try {
      const category = await new Category({ title: titleString });
      const saved = await category.save();
      console.log(saved);
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async function closeDB() {
    console.log("CLOSING CONNECTION");
    await mongoose.disconnect();
  }

  await seedCategory("Bulb");
  await seedCategory("Tubelight");
  await seedCategory("Fan");
  await seedCategory("Drivers");
  await seedCategory("Components");
  await seedCategory("Drones");
  await closeDB();
}

seedDB();
