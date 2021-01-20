const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");

const productRouter = require("./routers/products");
const categoryRouter = require("./routers/category");
const userRouter = require("./routers/user");
const orderRouter = require("./routers/order");
const authJwt = require("./util/jwt");
const errorHandler = require("./util/error-handler");

require("dotenv").config();

const app = express();

const api = process.env.BASE_URL;

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "ezshop-db",
  })
  .then(() => {
    console.log("Database Ready...");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log("server is running http://localhost:3000");
});

app.use(cors());
app.options("*", cors());

//Middleware
app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(authJwt());
app.use(errorHandler);

//Router
app.use(`${api}/products`, productRouter);
app.use(`${api}/category`, categoryRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/orders`, orderRouter);
