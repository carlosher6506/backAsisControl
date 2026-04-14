const pool = require('../../config/database');

exports.crearMateria = async (req, res) => {
  try {
    const { nombre } = req.body;

    const existe = await pool.query(
      `SELECT id FROM materias WHERE LOWER(nombre) = LOWER($1)`,
      [nombre]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe una materia con ese nombre' });
    }

    const result = await pool.query(
      `INSERT INTO materias (nombre) VALUES ($1) RETURNING *`,
      [nombre]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creando materia' });
  }
};

exports.obtenerMaterias = async (req, res) => {
  const result = await pool.query(`SELECT * FROM materias ORDER BY nombre`);
  res.json(result.rows);
};

exports.actualizarMateria = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  const result = await pool.query(
    `UPDATE materias SET nombre=$1 WHERE id=$2 RETURNING *`,
    [nombre, id]
  );
  res.json(result.rows[0]);
};

exports.eliminarMateria = async (req, res) => {
  const { id } = req.params;
  await pool.query(`DELETE FROM materias WHERE id=$1`, [id]);
  res.json({ message: 'Materia eliminada' });
};