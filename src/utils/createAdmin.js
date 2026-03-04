const pool = require('../config/database');
const bcrypt = require('bcrypt');

const crearAdmin = async () => {
    try {

        // Verificar si ya existe un usuario con rol admin
        const admin = await pool.query(`
            SELECT u.id
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE r.nombre = 'admin'
            LIMIT 1
        `);

        if (admin.rows.length > 0) {
            console.log('admin already exists.');
            return;
        }

        console.log('admin not found. Creating initial admin...');

        // Obtener id del rol admin
        const rolAdmin = await pool.query(
            `SELECT id FROM roles WHERE nombre = 'admin' LIMIT 1`
        );

        if (rolAdmin.rows.length === 0) {
            console.error('No admin role found. Please ensure the admin role exists in the roles table.');
            return;
        }

        const rolId = rolAdmin.rows[0].id;

        // Encriptar contraseña
        const passwordHash = await bcrypt.hash('admin123', 10);

        await pool.query(`
            INSERT INTO usuarios (nombre, email, password, rol_id, activo)
            VALUES ($1, $2, $3, $4, true)
        `, [
            'Administrador',
            'gohedevelop@gmail.com',
            passwordHash,
            rolId
        ]);

        console.log('Admin created successfully!');
        console.log('mail: gohedevelop@gmail.com');
        console.log('Password: admin123');

    } catch (error) {
        console.error(' Error to create admin:', error.message);
    }
};

module.exports = crearAdmin;