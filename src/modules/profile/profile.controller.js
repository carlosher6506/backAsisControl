const pool = require('../../config/database');
const path = require('path');
const fs = require('fs');

exports.obtenerPerfil = async (req, res) => {
  try {
    const { id } = req.user;
    const result = await pool.query(`
      SELECT p.*, u.nombre AS nombre_usuario, u.email
      FROM perfiles_maestro p
      RIGHT JOIN usuarios u ON p.usuario_id = u.id
      WHERE u.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.json({ usuario_id: id, existe: false });
    }

    res.json({ ...result.rows[0], existe: true });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo perfil' });
  }
};

exports.guardarPerfil = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      nombre, apellido, telefono, curp, rfc,
      especialidad, carrera, direccion, codigo_classroom
    } = req.body;

    // Verifica si ya existe
    const existe = await pool.query(
      `SELECT id FROM perfiles_maestro WHERE usuario_id = $1`, [id]
    );

    let result;
    if (existe.rows.length > 0) {
      result = await pool.query(`
        UPDATE perfiles_maestro SET
          nombre = $1, apellido = $2, telefono = $3,
          curp = $4, rfc = $5, especialidad = $6,
          carrera = $7, direccion = $8, codigo_classroom = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE usuario_id = $10
        RETURNING *
      `, [nombre, apellido, telefono, curp, rfc,
          especialidad, carrera, direccion, codigo_classroom, id]);
    } else {
      result = await pool.query(`
        INSERT INTO perfiles_maestro
        (usuario_id, nombre, apellido, telefono, curp, rfc,
         especialidad, carrera, direccion, codigo_classroom)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *
      `, [id, nombre, apellido, telefono, curp, rfc,
          especialidad, carrera, direccion, codigo_classroom]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error guardando perfil' });
  }
};