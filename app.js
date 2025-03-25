require("dotenv").config();
require("express-async-errors");
// express
const express = require("express");
const path = "/api/v1";
const app = express();
// rest of the packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const productRoutes = require("./routes/productRoute");
const paymentVerificationRoute = require("./routes/PaymentVerificationRoute");
const shopRoutes = require("./routes/shopRoute");
const orderRoutes = require("./routes/orderRoute");
const adminRoutes = require("./routes/AdminRoute");
const userRoute = require("./routes/userRoute");
const MenuRoute = require("./routes/MenuRoute");
const shopsCategoryRoutes = require("./routes/ShopsCategoryRoute");
app.use(express.urlencoded({ extended: true }));
// database
const connectDB = require("./db/connect");

// middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

// general routes
app.get("/", (req, res) => {
  res.send(`<h1>Welcome to Belongeen API</h1>`);
});
app.use(`${path}/admin`, adminRoutes);
app.use(`${path}/categories`, shopsCategoryRoutes);
app.use(`${path}/shop`, shopRoutes);
app.use(`${path}/product`, productRoutes);
app.use(`${path}/order`, orderRoutes);
app.use(`${path}/user`, userRoute);
app.use(`${path}/menu`, MenuRoute);
app.use(`${path}/payment`, paymentVerificationRoute);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
