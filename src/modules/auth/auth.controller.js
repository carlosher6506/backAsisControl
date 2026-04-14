const pool = require('../../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y password requeridos' });
        }

        const result = await pool.query(`
            SELECT u.*, r.nombre AS rol
            FROM usuarios u
            JOIN roles r ON u.rol_id = r.id
            WHERE u.email = $1
            AND u.activo = true
        `, [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = result.rows[0];

        const passwordValida = await bcrypt.compare(password, user.password);

        if (!passwordValida) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                rol: user.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en login' });
    }
};

exports.registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verifica si el email ya existe
    const existe = await pool.query(
      `SELECT id FROM usuarios WHERE email = $1`, [email]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Obtiene el rol de maestro
    const rolResult = await pool.query(
      `SELECT id FROM roles WHERE nombre = 'maestro'`
    );
    if (rolResult.rows.length === 0) {
      return res.status(500).json({ message: 'Rol maestro no encontrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(`
      INSERT INTO usuarios (nombre, email, password, rol_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, email
    `, [nombre, email, passwordHash, rolResult.rows[0].id]);

    res.json({ message: 'Cuenta creada correctamente', usuario: result.rows[0] });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando cuenta' });
  }
};