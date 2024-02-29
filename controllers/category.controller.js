const postgre = require('../database');

const categoryController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * FROM categories");
            res.json({ msg: "OK", data: rows });
        } catch (error) {
            res.json({ msg: error.msg });
        }
    },

    getById: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * FROM categories WHERE id_category = $1", [req.params.id]);

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
            const { name } = req.body;

            const sql = 'INSERT INTO categories(name) VALUES($1) RETURNING *';

            const { rows } = await postgre.query(sql, [name]);

            res.json({ msg: "OK", data: rows[0] });
        } catch (error) {
            res.json({ msg: error.msg });
        }
    },

    updateById: async (req, res) => {
        try {
            const { name } = req.body;

            const sql = 'UPDATE categories SET name = $1 WHERE id_category = $2 RETURNING *';

            const { rows } = await postgre.query(sql, [name, req.params.id]);

            res.json({ msg: "OK", data: rows[0] });
        } catch (error) {
            res.json({ msg: error.msg });
        }
    },

    deleteById: async (req, res) => {
        try {
            const sql = 'DELETE FROM categories WHERE id_category = $1 RETURNING *';

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

module.exports = categoryController;
