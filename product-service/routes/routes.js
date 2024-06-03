const Router = require("express").Router;
const router = new Router();
const Product = require("../models/Product");
const amqp = require("amqplib");

let connection, channel, order;
async function connectToMQ() {
  connection = await amqp.connect("amqp://127.0.0.1");
  channel = await connection.createChannel();
  await channel.assertQueue("product-service-queue");
}
connectToMQ();
//create product
router.post("/", async (req, res) => {
  const { name, price, quantity } = req.body;
  if (!name || !price || !quantity) {
    return res.status(400).json({ message: "please provide product detials" });
  }
  const product = await new Product({ name, price, quantity });
  await product.save();
  return res
    .status(201)
    .json({ message: "product created successfully", product });
});

router.post("/buy", async (req, res) => {
  const { productsIds } = req.body;
  const products = await Product.find({ _id: { $in: productsIds } });
  channel.sendToQueue(
    "order-service-queue",
    Buffer.from(JSON.stringify({ products }))
  );
  channel.consume("product-service-queue", (data) => {
    console.log("consume from product");
    order = JSON.parse(data.content.toString());
    channel.ack(data);
  });
  return res.status(201).json({ message: "order placed" });
});

module.exports = router;
