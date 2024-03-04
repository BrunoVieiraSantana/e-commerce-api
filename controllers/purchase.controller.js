const postgre = require('../database');

const purchaseController = {
    createPurchase: async (req, res) => {
        try {
            const { user_id, cartItems } = req.body;

            await postgre.query('BEGIN');

            for (const item of cartItems) {
                const { product_id, quantity } = item;

                // Consulta para obter o estoque disponível do produto
                const query = "SELECT stock FROM products WHERE id_product = $1";
                const { rows: productRows } = await postgre.query(query, [product_id]);

                // Verificar se há resultados da consulta
                if (productRows.length === 0) {
                    await postgre.query('ROLLBACK');
                    return res.status(404).json({ msg: `Product with ID ${product_id} not found` });
                }

                // Obter o estoque disponível
                const availableStock = productRows[0].stock;

                if (quantity > availableStock) {
                    await postgre.query('ROLLBACK');
                    return res.status(400).json({ msg: `Not enough stock available for product with ID ${product_id}` });
                }

                // Inserção da compra
                const purchaseDate = new Date().toISOString();
                const purchaseQuery = `
                    INSERT INTO purchases (purchase_date, user_id)
                    VALUES ($1, $2)
                    RETURNING id_purchase
                `;
                const purchaseValues = [purchaseDate, user_id];
                const { rows: purchaseRows } = await postgre.query(purchaseQuery, purchaseValues);
                const purchaseId = purchaseRows[0].id_purchase;

                // Inserção do item da compra
                const itemQuery = `
                    INSERT INTO items (user_id, product_id, purchase_id, quantity)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
                `;
                const itemValues = [user_id, product_id, purchaseId, quantity];
                const { rows: itemRows } = await postgre.query(itemQuery, itemValues);

                // Atualização do estoque
                const updateStockQuery = `
                    UPDATE products 
                    SET stock = stock - $1 
                    WHERE id_product = $2;
                `;
                await postgre.query(updateStockQuery, [quantity, product_id]);
            }

            await postgre.query('COMMIT');

            res.json({ msg: "Purchase completed successfully" });

        } catch (error) {
            await postgre.query('ROLLBACK');
            console.error(error);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    }
};

module.exports = purchaseController;
