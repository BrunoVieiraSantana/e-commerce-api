const express = require("express");
const router = express.Router();

const purchaseController = require('../controllers/purchase.controller');

router.post("/", purchaseController.createPurchase);
router.get("/user/:user_id", purchaseController.getAllPurchasesByUser);
router.post("/cart/checkout", purchaseController.checkout);
router.post("/cart/add", purchaseController.addToCart);
router.delete("/cart/remove/:user_id/:product_id", purchaseController.removeFromCart);

module.exports = router;
