const postgre = require('../database')
const productController = {
    getAll: async(req, res) => {
        try {
            res.json({msg: "OK"})
        } catch (error) {
            res.json({msg: error.msg})
        }
    }

}


module.exports = productController