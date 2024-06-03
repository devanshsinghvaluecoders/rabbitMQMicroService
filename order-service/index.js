const express = require("express");
const app = express();
const Port = 3002;
const mongoose = require("mongoose");
const Order = require("./models/Order");
const amqp = require("amqplib");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let connection, channel, order;

async function connectToMQ() {
  connection = await amqp.connect("amqp://127.0.0.1");
  channel = await connection.createChannel();
  await channel.assertQueue("order-service-queue");
}
connectToMQ().then(() => {
  channel.consume("order-service-queue", async (data) => {
    const { products } = JSON.parse(data.content.toString());

    const newOrder = await createOrder(products);
    channel.ack(data);
    channel.sendToQueue(
      "product-service-queue",
      Buffer.from(JSON.stringify(newOrder))
    );
  });
});
createOrder = async (products) => {
  let total = 0;
  products.forEach((element) => {
    total += element.price;
  });

  const order = await new Order({ products, total });
  await order.save();
  return order;
};
mongoose
  .connect("")
  .then(() => {
    console.log("product service connected");
  })
  .catch((err) => console.log(err));
app.listen(Port, () => {
  console.log(`order service running on port - ${Port}`);
});
