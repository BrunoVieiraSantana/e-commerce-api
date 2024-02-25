const express = require("express");
const router = express.Router();

const saleController = require('../controllers/sale.controller');

router.get("/", saleController.getAll);
router.get("/:id", saleController.getById);
router.post("/", saleController.create);
router.put("/:id", saleController.updateById);
router.delete("/:id", saleController.deleteById);

module.exports = router;
