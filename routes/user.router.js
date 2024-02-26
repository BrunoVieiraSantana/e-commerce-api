const express = require("express");
const router = express.Router();

const userController = require('../controllers/user.controller');

router.get("/", userController.getAll);
router.get("/:id", userController.getById);
router.post("/", userController.create);
router.put("/:id", userController.updateById);
router.delete("/:id", userController.deleteById);
router.post("/authenticate", userController.authenticateUser);

module.exports = router;
