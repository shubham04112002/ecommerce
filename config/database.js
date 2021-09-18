const mongoose = require("mongoose");
module.exports.connectDB = async () => {
  try {
    const uri =
      process.env.MONGO_URI || "mongodb://mymongo:27017/flash-tutorial";
    console.log(uri);
    await mongoose
      .connect(uri, {
        useNewUrlParser: true,
        // useCreateIndex: true,
        // useFindAndModify: false,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("Mongo database connected to express successfully");
      })
      .catch((error) => console.log("Mongooose Error !!!", error));
  } catch (error) {
    console.log(error);
    return error;
  }
};
