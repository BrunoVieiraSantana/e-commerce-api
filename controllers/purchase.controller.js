const postgre = require('../database');

const purchaseController = {
    createPurchase: async (req, res) => {
        try {
            const { user_id, Item: { cartItems } } = req.body;
            console.log(`User ID: ${user_id}, Cart Items:`, cartItems);

            await postgre.query('BEGIN');

            for (const cartItem of cartItems) {
                const { name, price, qty, subTotal, thumbnail, id } = cartItem;

                const { rows: productRows } = await postgre.query("SELECT id_product, stock FROM products WHERE name = $1", [name]);
                const { id_product, stock } = productRows[0];

                if (qty > stock) {
                    await postgre.query('ROLLBACK');
                    return res.status(400).json({ msg: `Not enough stock available for ${name}` });
                }

                const purchaseDate = new Date().toISOString();
                const purchaseQuery = `
                    INSERT INTO purchases (purchase_date)
                    VALUES ($1)
                    RETURNING id_purchase
                `;
                const purchaseValues = [purchaseDate];
                const { rows: purchaseRows } = await postgre.query(purchaseQuery, purchaseValues);
                const purchaseId = purchaseRows[0].id_purchase;

                const itemQuery = `
                    INSERT INTO items (user_id, product_id, purchase_id, purchase_price, quantity, status)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                `;
                const itemValues = [user_id, id_product, purchaseId, price, qty, 'pending'];
                const { rows: itemRows } = await postgre.query(itemQuery, itemValues);

                const updateStockQuery = `
                    UPDATE products 
                    SET stock = stock - $1 
                    WHERE id_product = $2;
                `;
                await postgre.query(updateStockQuery, [qty, id_product]);
            }

            await postgre.query('COMMIT');

            res.json({ msg: "Purchase completed successfully" });

        } catch (error) {
            await postgre.query('ROLLBACK');
            console.error(error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    },

    getAllPurchasesByUser: async (req, res) => {
        try {
            const { user_id } = req.params;

            console.log("User ID requested:", user_id);

            const query = `
                SELECT * FROM items
                WHERE user_id = $1;
            `;

            const { rows: purchases } = await postgre.query(query, [user_id]);

            res.json({ purchases });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    }
};

module.exports = purchaseController;
