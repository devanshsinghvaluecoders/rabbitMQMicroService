const express = require("express");
const app = express();
const Port = 3001;
const mongoose = require("mongoose");
const productRoute = require("./routes/routes");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/products", productRoute);
mongoose
  .connect("")
  .then(() => {
    console.log("product service connected");
  })
  .catch((err) => console.log(err));
app.listen(Port, () => {
  console.log(`product service running on port - ${Port}`);
});
