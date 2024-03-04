const postgre = require('../database');

const purchaseController = {
    createPurchase: async (req, res) => {
        try {
            const { user_id, product_id, purchase_date, purchase_price, quantity, status } = req.body;

            if (!user_id || !product_id || !purchase_price) {
                return res.status(400).json({ msg: "Missing required fields" });
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
            console.error(error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    },

    getAllPurchasesByUser: async (req, res) => {
        try {
            const { user_id } = req.params;

            const sql = `SELECT to_char(p.purchase_date, 'DD/MM/YYYY') AS purchase_date_formatted,
                                pr.title AS product_name,
                                i.purchase_price AS product_price,
                                i.status AS payment_status
                         FROM purchases p
                         JOIN items i ON p.id_purchase = i.purchase_id
                         JOIN products pr ON i.product_id = pr.id_product
                         WHERE i.user_id = $1`;

            const { rows } = await postgre.query(sql, [user_id]);

            res.json({ msg: "OK", data: rows });

        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    },

    addToCart: async (req, res) => {
        try {
            const { user_id, product_id, quantity } = req.body;
        
            
            const product = await postgre.query("SELECT stock FROM products WHERE id_product = $1", [product_id]);
            if (!product.rows[0]) {
                return res.status(404).json({ msg: "Product not found" });
            }
        
            if (product.rows[0].stock < quantity) {
                return res.status(400).json({ msg: "Insufficient stock" });
            }
        
           
            const { rows } = await postgre.query("INSERT INTO items (user_id, product_id, quantity, status) VALUES ($1, $2, $3, 'Esperando Pagamento') RETURNING *", [user_id, product_id, quantity]);
        
            res.json({ msg: "Product added to cart", data: rows[0] });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    },
    
    removeFromCart: async (req, res) => {
        try {
            const { user_id, product_id } = req.params;
        
            
            const { rowCount } = await postgre.query("DELETE FROM items WHERE user_id = $1 AND product_id = $2 RETURNING *", [user_id, product_id]);
        
            if (rowCount === 0) {
                return res.status(404).json({ msg: "Product not found in the user's cart" });
            }
        
            res.json({ msg: "Product removed from cart" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    },
    
    checkout: async (req, res) => {
        try {
            const { user_id } = req.body;
        
            
            const { rowCount: cartItemCount } = await postgre.query("SELECT * FROM items WHERE user_id = $1", [user_id]);
            if (cartItemCount === 0) {
                return res.status(400).json({ msg: "The user's cart is empty" });
            }
        
           
            const { rows: purchaseRows } = await postgre.query("INSERT INTO purchases (user_id, purchase_date) VALUES ($1, NOW()) RETURNING *", [user_id]);
            const purchase_id = purchaseRows[0].id_purchase;
        
            
            await postgre.query("UPDATE items SET status = 'Finalizado', purchase_id = $1 WHERE user_id = $2", [purchase_id, user_id]);
        
            res.json({ msg: "Purchase completed successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    }
};

module.exports = purchaseController;
