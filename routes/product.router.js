const express = require("express")
const router = express.Router()

const productController = require('../controllers/product.controller')

router.get("/", productController.getAll)
router.get("/:id", productController.getById)
router.post("/", productController.create)
router.put("/:id", productController.updateById)
router.delete("/:id", productController.deleteById)

module.exports = router
