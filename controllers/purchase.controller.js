const postgre = require('../database');

const purchaseController = {
    createPurchase: async (req, res) => {
        try {
            const { user_id, name, price, qty, subTotal, thumbnail, id } = req.body;
            
            console.log("Received request body:", req.body);

            if (!user_id || !name || !price || !qty || !subTotal || !thumbnail || !id) {
                console.log("Missing required fields in request body");
                return res.status(400).json({ msg: "Missing required fields in request body" });
            }

            const cartItem = { name, price, qty, subTotal, thumbnail, id };
            const cartItems = [cartItem];

            console.log(`User ID: ${user_id}, Cart Items:`, cartItems);

            await postgre.query('BEGIN');

            for (const cartItem of cartItems) {
                const { name, price, qty, subTotal, thumbnail, id } = cartItem;

                console.log("Processing cart item:", cartItem);

                const { rows: productRows } = await postgre.query("SELECT id_product, stock FROM products WHERE id_product = $1", [id]);
                
                if (!productRows || productRows.length === 0) {
                    await postgre.query('ROLLBACK');
                    console.log(`Product '${name}' not found in the database`);
                    return res.status(400).json({ msg: `Product '${name}' not found in the database` });
                }
                
                const { id_product, stock } = productRows[0];

                if (qty > stock) {
                    await postgre.query('ROLLBACK');
                    console.log(`Not enough stock available for ${name}`);
                    return res.status(400).json({ msg: `Not enough stock available for ${name}` });
                }

                const purchaseDate = new Date().toISOString();
                console.log("Creating purchase with date:", purchaseDate);
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
                const itemValues = [user_id, id_product, purchaseId, price, qty, 'Esperando Pagamento'];
                console.log("Item values:", itemValues);
                const { rows: itemRows } = await postgre.query(itemQuery, itemValues);

                const updateStockQuery = `
                    UPDATE products 
                    SET stock = stock - $1 
                    WHERE id_product = $2;
                `;
                await postgre.query(updateStockQuery, [qty, id_product]);
                console.log(`Stock updated for product ${id_product}`);
            }

            await postgre.query('COMMIT');
            console.log("Transaction committed successfully");

            res.json({ msg: "Purchase completed successfully" });

        } catch (error) {
            await postgre.query('ROLLBACK');
            console.error("Error occurred:", error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    },

    getAllPurchasesByUser: async (req, res) => {
        try {
            const { user_id } = req.params;
    
            console.log("User ID requested:", user_id);
    
            const query = `
                SELECT TO_CHAR(pu.purchase_date, 'DD/MM/YYYY') AS purchase_date_formatted, i.id_item, u.name AS user_name, p.title AS product_title, i.purchase_price, i.quantity, i.status
                FROM items i
                JOIN purchases pu ON i.purchase_id = pu.id_purchase
                JOIN products p ON i.product_id = p.id_product
                JOIN users u ON i.user_id = u.id_user
                WHERE i.user_id = $1
                ORDER BY pu.purchase_date;
            `;
    
            const { rows: purchases } = await postgre.query(query, [user_id]);
            console.log("Purchases:", purchases);
    
            res.json({ purchases });
        } catch (error) {
            console.error("Error occurred:", error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    }
};

module.exports = purchaseController;
