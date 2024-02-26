const postgre = require('../database');

const saleController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * FROM sales");
            res.json({ msg: "OK", data: rows });
        } catch (error) {
            res.json({ msg: error.msg });
        }
    },
    getById: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * FROM sales WHERE id_sale = $1", [req.params.id]);

            if (rows[0]) {
                return res.json({ msg: "OK", data: rows });
            }

            res.status(404).json({ msg: "not found" });
        } catch (error) {
            res.json({ msg: error.msg });
        }
    },
    create: async (req, res) => {
        try {
            const { user_id, product_id, purchase_date, purchase_price, quantity, status } = req.body;

            const sql = 'INSERT INTO sales(user_id, product_id, purchase_date, purchase_price, quantity, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';

            const { rows } = await postgre.query(sql, [user_id, product_id, purchase_date, purchase_price, quantity, status]);

            res.json({ msg: "OK", data: rows[0] });

        } catch (error) {
            res.json({ msg: error.msg });
        }
    },
    updateById: async (req, res) => {
        try {
            const { user_id, product_id, purchase_date, purchase_price, quantity, status } = req.body;

            const sql = 'UPDATE sales SET user_id = $1, product_id = $2, purchase_date = $3, purchase_price = $4, quantity = $5, status = $6 WHERE id_sale = $7 RETURNING *';

            const { rows } = await postgre.query(sql, [user_id, product_id, purchase_date, purchase_price, quantity, status, req.params.id]);

            res.json({ msg: "OK", data: rows[0] });
        } catch (error) {
            res.json({ msg: error.msg });
        }
    },

    deleteById: async (req, res) => {
        try {
            const sql = 'DELETE FROM sales WHERE id_sale = $1 RETURNING *';

            const { rows } = await postgre.query(sql, [req.params.id]);

            if (rows[0]) {
                return res.json({ msg: "OK", data: rows[0] });
            }

            return res.status(404).json({ msg: "not found" });

        } catch (error) {
            res.json({ msg: error.msg });
        }
    }
};

module.exports = saleController;
