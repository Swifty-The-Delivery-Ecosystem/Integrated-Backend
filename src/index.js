const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

// routes
const userAuthRoutes = require("./routes/auth.user.route");
const vendorAuthRoutes = require("./routes/auth.vendor.route");
const orderRoutes = require("./routes/order.route");
const vendorRoutes = require("./routes/inventory.route");
const userRoutes = require("./routes/get.user.route");
const paymentAuthRoutes = require("./routes/payment.route");

const { PORT, MONGODB_URI, NODE_ENV, ORIGIN } = require("./config");
const { API_ENDPOINT_NOT_FOUND_ERR, SERVER_ERR } = require("./errors");

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ORIGIN,
    optionsSuccessStatus: 200,
  })
);

if (NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// routes middlewares

app.use("/api/userAuth", userAuthRoutes);
app.use("/api/vendorAuth", vendorAuthRoutes);
app.use("/api/customer", userRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentAuthRoutes);

// page not found error handling  middleware

// app.use("*", (req, res, next) => {
//   const error = {
//     status: 404,
//     message: API_ENDPOINT_NOT_FOUND_ERR,
//   };
//   next(error);
// });

// global error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  const status = err.status || 500;
  const message = err.message || SERVER_ERR;
  const data = err.data || null;
  res.status(status).json({
    type: "error",
    message,
    data,
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    type: "success",
    message: "Server is up and running.",
    data: null,
  });
});

async function main() {
  try {
    console.log(MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("database connected");

    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();
