const express = require("express")
const app = express()

app.use(express.json())

const productRouter = require('./routes/product.router')

app.use("/api/v1/products", productRouter)

app.listen(5000, () => console.log("Server is running on port 5000"))