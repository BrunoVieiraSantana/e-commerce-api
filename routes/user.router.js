const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const secret = 'ecommerce_secret'; 


const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];


    const publicRoutes = ['/authenticate', '/', '/create']; 


    if (publicRoutes.includes(req.path)) {
        return next(); 
    }

    if (!token) {
        return res.status(401).json({ msg: 'Token not provided' });
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ msg: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
};

const userController = require('../controllers/user.controller');

router.get("/", verifyToken, userController.getAll);
router.get("/:id", verifyToken, userController.getById);
router.put("/:id", verifyToken, userController.updateById);
router.delete("/:id", verifyToken, userController.deleteById);
router.post("/authenticate", userController.authenticateUser);
router.post("/create", userController.create);

module.exports = router;
