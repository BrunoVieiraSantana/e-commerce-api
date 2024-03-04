// purchase.controller.js
const postgre = require('../database');

const purchaseController = {
    createPurchase: async (req, res) => {
        try {
            const { user_id, product_id, purchase_date, purchase_price, quantity, status } = req.body;

            if (!user_id || !product_id || !purchase_price) {
                return res.status(400).json({ msg: "Missing required fields" });
            }

            const checkStockQuery = `
                SELECT stock FROM products WHERE id_product = $1;
            `;
            const { rows: stockData } = await postgre.query(checkStockQuery, [product_id]);

            const currentStock = stockData[0].stock;

            if (currentStock < quantity) {
                return res.status(400).json({ msg: "Insufficient stock" });
            }

            let sql = `
                WITH new_purchase AS (
                    INSERT INTO purchases (purchase_date)
                    VALUES ($1)
                    RETURNING id_purchase
                )
                INSERT INTO items (user_id, product_id, purchase_id, purchase_price, quantity, status)
                SELECT
                    $2 AS user_id,
                    $3 AS product_id,
                    new_purchase.id_purchase AS purchase_id,
                    $4 AS purchase_price,
                    $5 AS quantity,
                    $6 AS status
                FROM new_purchase
                RETURNING *;
            `;

            const values = [purchase_date || 'now()', user_id, product_id, purchase_price, quantity || 1, status || 'Esperando Pagamento'];

            const { rows } = await postgre.query(sql, values);

            const updateStockQuery = `
                UPDATE products 
                SET stock = stock - $1 
                WHERE id_product = $2;
            `;
            await postgre.query(updateStockQuery, [quantity, product_id]);

            res.json({ msg: "OK", data: rows[0] });

        } catch (error) {
            res.status(500).json({ msg: error.message });
        }
    }
};

module.exports = purchaseController;
