const postgre = require('../database');

const purchaseController = {
    createPurchase: async (req, res) => {
        try {
            const { user_id, product_id, purchase_date, purchase_price, status } = req.body;

            const sql = 'INSERT INTO sales(user_id, product_id, purchase_date, purchase_price, status) VALUES($1, $2, $3, $4, $5) RETURNING *';

            const { rows } = await postgre.query(sql, [user_id, product_id, purchase_date, purchase_price, status]);

            res.json({ msg: "OK", data: rows[0] });

        } catch (error) {
            res.json({ msg: error.msg });
        }
    },

    getAllPurchasesByUser: async (req, res) => {
        try {
            const { user_id } = req.params;

            const sql = `SELECT to_char(p.purchase_date, 'DD/MM/YYYY') AS purchase_date_formatted,
                                pr.title AS product_name,
                                i.purchase_price AS product_price,
                                i.status AS payment_status
                         FROM sales p
                         JOIN items i ON p.id_sale = i.sale_id
                         JOIN products pr ON i.product_id = pr.id_product
                         WHERE p.user_id = $1`;

            const { rows } = await postgre.query(sql, [user_id]);

            res.json({ msg: "OK", data: rows });

        } catch (error) {
            res.json({ msg: error.msg });
        }
    }
};

module.exports = purchaseController;
