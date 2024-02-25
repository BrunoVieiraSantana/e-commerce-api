const express = require("express");
const app = express();
const cors = require('cors');
app.use(cors());

require('dotenv').config();

app.use(express.json());

const productRouter = require('./routes/product.router');
const userRouter = require('./routes/user.router');
const saleRouter = require('./routes/sale.router'); 

app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter); 
app.use("/api/v1/sales", saleRouter); 

app.listen(process.env.PORT, () => console.log("Server is running on port 5000"));
