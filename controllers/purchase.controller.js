const postgre = require('../database');

const createPurchase = async (req, res) => {
  try {
    const { user_id } = req.body;

    for (const item of req.body) {
      const { product_id, purchase_price, quantity, status } = item;

      const { rows: productRows } = await postgre.query("SELECT stock FROM products WHERE id_product = $1", [product_id]);
      
      const availableStock = productRows[0].stock;

      if (quantity > availableStock) {
        return res.status(400).json({ msg: "Not enough stock available" });
      }

      await postgre.query('BEGIN');

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
      const itemValues = [user_id, product_id, purchaseId, purchase_price, quantity, status];
      const { rows: itemRows } = await postgre.query(itemQuery, itemValues);

      const updateStockQuery = `
          UPDATE products 
          SET stock = stock - $1 
          WHERE id_product = $2;
      `;
      await postgre.query(updateStockQuery, [quantity, product_id]);

      await postgre.query('COMMIT');
    }

    res.json({ msg: "Purchase completed successfully" });

  } catch (error) {
    await postgre.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

module.exports = { createPurchase };

