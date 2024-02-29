const express = require("express");
const router = express.Router();

const categoryController = require('../controllers/category.controller');

router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.post("/", categoryController.create);
router.put("/:id", categoryController.updateById);
router.delete("/:id", categoryController.deleteById);

module.exports = router;
