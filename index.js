const express = require("express");
const app = express();
const cors = require('cors');
app.use(cors());

require('dotenv').config();

app.use(express.json());

const productRouter = require('./routes/product.router');
const userRouter = require('./routes/user.router');
const purchaseRouter = require('./routes/purchase.router');
const categoryRouter = require('./routes/category.router'); 

app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/purchases", purchaseRouter);
app.use("/api/v1/categories", categoryRouter); 

app.listen(process.env.PORT, () => console.log("Server is running on port", process.env.PORT));
