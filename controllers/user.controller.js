const postgre = require('../database');
const jwt = require('jsonwebtoken');
const secret = 'ecommerce_secret';

const userController = {
    getAll: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * FROM users");
            res.json({ msg: "OK", data: rows });
        } catch (error) {
            res.json({ msg: error.msg });
        }
    },
    getById: async (req, res) => {
        try {
            const { rows } = await postgre.query("SELECT * FROM users WHERE id_user = $1", [req.params.id]);

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
            const { name, email, password } = req.body;

            const sql = 'INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *';

            const { rows } = await postgre.query(sql, [name, email, password]);

            res.json({ msg: "OK", data: rows[0] });

        } catch (error) {
            res.json({ msg: error.msg });
        }
    },
    updateById: async (req, res) => {
        try {
            const { name, email, password } = req.body;

            const sql = 'UPDATE users SET name = $1, email = $2, password = $3 WHERE id_user = $4 RETURNING *';

            const { rows } = await postgre.query(sql, [name, email, password, req.params.id]);

            res.json({ msg: "OK", data: rows[0] });
        } catch (error) {
            res.json({ msg: error.msg });
        }
    },

    deleteById: async (req, res) => {
        try {
            const sql = 'DELETE FROM users WHERE id_user = $1 RETURNING *';

            const { rows } = await postgre.query(sql, [req.params.id]);

            if (rows[0]) {
                return res.json({ msg: "OK", data: rows[0] });
            }

            return res.status(404).json({ msg: "not found" });

        } catch (error) {
            res.json({ msg: error.msg });
        }
    },

    authenticateUser: async (req, res) => {
        try {
            const { email, password } = req.body;
    
            const query = 'SELECT id_user, name, email FROM users WHERE email = $1 AND password = $2';
            const { rows } = await postgre.query(query, [email, password]);
    
            if (rows.length > 0) {
                const user = rows[0];
                const token = jwt.sign({ email: user.email, id: user.id_user, name: user.name }, secret, { expiresIn: '1h' });
    
                return res.status(200).json({ token, name: user.name, id: user.id_user });
            } else {
                return res.status(401).json({ msg: "Não autorizado" });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Erro interno do servidor" });
        }
    }

};

module.exports = userController;
