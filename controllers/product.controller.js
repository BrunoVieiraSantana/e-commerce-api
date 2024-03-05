const postgre = require('../database')
const productController = {
    getAll: async(req, res) => {
        try {
            const { rows } = await postgre.query("select * from products")
            res.json({msg: "OK", data: rows})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    getById: async(req, res) => {
        try {
            const { rows } = await postgre.query("select * from products where id_product = $1", [req.params.id])

            if (rows[0]) {
                return res.json({msg: "OK", data: rows})
            }

            res.status(404).json({msg: "not found"})
        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    create: async(req, res) => {
        try {
            const { title, description, category_id, currentPrice, stock, mainimg, thumbnail } = req.body

            const sql = 'INSERT INTO products(title, description, category_id, currentPrice, stock, mainimg, thumbnail) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';

            const { rows } = await postgre.query(sql, [title, description, category_id, currentPrice, stock, mainimg, thumbnail]);

            res.json({msg: "OK", data: rows[0]})

        } catch (error) {
            res.json({msg: error.msg})
        }
    },
    updateById: async (req, res) => {
        try {
            const { title, description, category_id, currentPrice, stock, mainimg, thumbnail } = req.body;
    
            const sql = 'UPDATE products SET title = $1, description = $2, category_id = $3, currentPrice = $4, stock = $5, mainimg = $6, thumbnail = $7 WHERE id_product = $8 RETURNING *';
    
            const { rows } = await postgre.query(sql, [title, description, category_id, currentPrice, stock, mainimg, thumbnail, req.params.id]);
    
            res.json({ msg: "OK", data: rows[0] });
        } catch (error) {
            res.json({ msg: error.msg });
        }
    },
    
    deleteById: async(req, res) => {
        try {
            const sql = 'DELETE FROM products where id_product = $1 RETURNING *'

            const { rows } = await postgre.query(sql, [req.params.id])

            if (rows[0]) {
                return res.json({msg: "OK", data: rows[0]})
            }

            return res.status(404).json({msg: "not found"})
            

        } catch (error) {
            res.json({msg: error.msg})
        }
    }
}

module.exports = productController