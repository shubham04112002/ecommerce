const AdminBro = require("admin-bro");
const { buildRouter } = require("admin-bro-expressjs");
const AdminBroMongoose = require("admin-bro-mongoose");
AdminBro.registerAdapter(AdminBroMongoose);

const mongoose = require("mongoose");
const options = require("../config/admin.options");
console.log("options",options);
const express = require("express");
const app = express();

const admin = new AdminBro(options);

const router = buildRouter(admin);

module.exports = { router, admin };
