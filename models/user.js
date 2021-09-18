const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// encrypting the password using bcrypt just before storing
userSchema.methods.encryptPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// checking password by comparing using bcrypt

// execution context means this

// here arrow function doesnot work because of the value of this is not equal to the userSchema
// The arrow function doesnot define it's own execution context,no matter how or where being executed,this value inside of an arrow function is always equas to this value from the outer function.In other words arraow function resolves lexically

// userSchema.methods.validatePassword = async (candidatePassword) => {
//   console.log("this is",this);
//   if (this.password !== null) {
//     return await bcrypt.compare(candidatePassword, this.password);
//   }
//   return false;
// };

userSchema.methods.validatePassword = async function (candidatePassword) {
  if (this.password !== null) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
  return false;
};

// here regular function should be used because the execution context will be set to the object where the function is declared in this case the user Schema

module.exports = mongoose.model("User", userSchema);
