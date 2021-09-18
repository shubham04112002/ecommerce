const path = require("path");
const Product = require("../models/product");
const Category = require("../models/category");
const mongoose = require("mongoose");
const faker = require("faker");
const { connectDB } = require("../config/database");
console.log(
  "*************************************PRODUCT SEED*********************************"
);

connectDB();

async function seedDB() {
  await Product.deleteMany({});
  faker.seed(0);

  //   bulb titles

  const bulbTitles = [
    "Incandescent Bulbs",
    "Fluorescent Lamps",
    "Compact Fluorescent Lamps",
    "Halogen Lamps",
    "Light Emitting Diode",
  ];

  //   bulb Images
  const bulbImages = [
    "https://miro.medium.com/max/1400/1*A3X0C-KmuAJJFiMVpXbH5A.jpeg",
    "https://miro.medium.com/max/700/1*e999KUtJvhepYJHGizoS2A.jpeg",
    "https://miro.medium.com/max/700/1*ZMFdIbauucVYXCSFTO4pbg.jpeg",
    "https://miro.medium.com/max/700/1*RdKVTPVlrdpyIzPoiu6TqA.jpeg",
    "https://miro.medium.com/max/700/1*rrRPb0qEYbHPddQlpgCzNg.jpeg",
  ];

  //   Tubelight titles
  const tubelightTitles = [
    "ULTRA BRIGHT FAN SHAPE 45W BULB CFL TUBE LIGHT",
    "LED Tube Lights",
  ];

  //   Tubelight Images

  const tubelightImages = [
    "https://cdn.shopify.com/s/files/1/0290/8513/9081/products/246a_1024x1024@2x.jpg?v=1602268335",
    "https://cdn1.industrybuying.com/products_medium/led-lights/led-tube-light/LED.LED.19458791.jpg",
  ];

  //   fan Titles
  const fanTitles = [
    "The cieling fan",
    "The Table Fan",
    "The pedestral fan",
    "The Exhaust fan",
  ];
  //  fan Images
  const fanImages = [
    "https://finolex.com/wp-content/uploads/2018/09/fan1_1.jpg",
    "https://finolex.com/wp-content/uploads/2018/10/fan-4_1.jpg",
    "https://finolex.com/wp-content/uploads/2018/10/fan-4_2.jpg",
    "https://finolex.com/wp-content/uploads/2018/10/fan-4_3.jpg",
  ];

  //   Driver Titles
  const driverTitles = [
    "The Relay",
    "The connectors",
    "The transistors",
    "The mosfet",
    "Switch module",
  ];
  //   Driver Images
  const driverImages = [
    "https://os.mbed.com/media/uploads/4180_1/piservo.jpg",
    "https://os.mbed.com/media/uploads/4180_1/adaservo.jpg",
    "https://os.mbed.com/media/uploads/4180_1/_scaled_mosfet_symbol.jpg",
    "https://os.mbed.com/media/uploads/4180_1/_scaled_mdriver.jpg",
    "https://os.mbed.com/media/uploads/4180_1/igbtmodule.jpg",
  ];

  //   Components Title
  const componentTitles = [
    "Semiconductors",
    "Display technologies",
    "Vacuum tubes",
    "Resistors",
    "Capacitors",
  ];
  // Component Images
  const componentImages = [
    "https://gumlet.assettype.com/swarajya%2F2021-01%2F15ba9928-76c6-4a1b-9e67-b70937bd2ca6%2FIndian_chip.jpg?w=480&q=75&auto=format%2Ccompress",
    "https://www.elprocus.com/wp-content/uploads/2014/09/Screenless-Display.png",
    "https://upload.wikimedia.org/wikipedia/commons/e/e9/Elektronenroehren-auswahl.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/7/75/Electronic-Axial-Lead-Resistors-Array.jpg",
    "https://media.istockphoto.com/vectors/electronics-part-vector-id943764758?s=612x612",
  ];

  //   drones titles
  const droneTitles = [
    "Single Rotor Drone",
    "Multi Rotor Drone",
    "fixed wing drone",
    "Fixed-Wing Hybrid Drones",
  ];
  // drone Images
  const droneImages = [
    "https://aerocorner.com/wp-content/uploads/2020/02/Northrop-Grummans-RQ-8-Fire-Scout-UAV.jpg",
    "https://aerocorner.com/wp-content/uploads/2020/02/DJI-Phantom-Drone.jpg",
    "https://aerocorner.com/wp-content/uploads/2020/02/Boeing-Scan-Eagle-Unmanned-Aerial-Vehicle.jpg",
    "https://aerocorner.com/wp-content/uploads/2020/02/VTOL-UAV-prototype-NASA.jpg",
  ];

  async function seedProducts(titlesArray, imagesArray, categoryString) {
    try {
      const category = await Category.findOne({ title: categoryString });
      for (let i = 0; i < titlesArray.length; i++) {
        let product = await new Product({
          productCode: faker.helpers.replaceSymbolWithNumber("9#########"),
          title: titlesArray[i],
          imagePath: imagesArray[i],
          description: faker.commerce.productDescription(),
          price: faker.commerce.price(),
          category,
          manufacturer: faker.vehicle.manufacturer(),
          available: faker.datatype.boolean(),
          createdAt: faker.date.past(),
        });
        await product.save();
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async function closeDB() {
    console.log("CLOSING CONNECTION");
    await mongoose.disconnect();
  }

  await seedProducts(bulbTitles, bulbImages, "Bulb");
  await seedProducts(tubelightTitles, tubelightImages, "Tubelight");
  await seedProducts(fanTitles, fanImages, "Fan");
  await seedProducts(driverTitles, driverImages, "Drivers");
  await seedProducts(componentTitles, componentImages, "Components");
  await seedProducts(droneTitles, droneImages, "Drones");
  await closeDB();
}

seedDB();
