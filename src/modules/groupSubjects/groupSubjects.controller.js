const pool = require('../../config/database');

exports.asignarMateria = async (req, res) => {
  try {
    const { grupo_id, materia_id, maestro_id } = req.body;

    const existe = await pool.query(
      `SELECT id FROM grupo_materias WHERE grupo_id=$1 AND materia_id=$2`,
      [grupo_id, materia_id]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'Esta materia ya está asignada a este grupo' });
    }

    const result = await pool.query(`
      INSERT INTO grupo_materias (grupo_id, materia_id, maestro_id)
      VALUES ($1, $2, $3) RETURNING *
    `, [grupo_id, materia_id, maestro_id]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error asignando materia' });
  }
};

exports.obtenerGrupoMaterias = async (req, res) => {
  const result = await pool.query(`
    SELECT 
      gm.*,
      m.nombre AS materia_nombre,
      g.nombre AS grupo_nombre,
      u.nombre AS maestro_nombre,
      na.nombre AS nivel_academico,
      ne.nombre AS nivel_educativo
    FROM grupo_materias gm
    JOIN materias m ON gm.materia_id = m.id
    JOIN grupos g ON gm.grupo_id = g.id
    JOIN usuarios u ON gm.maestro_id = u.id
    JOIN niveles_academicos na ON g.nivel_academico_id = na.id
    JOIN niveles_educativos ne ON na.nivel_educativo_id = ne.id
    ORDER BY gm.id
  `);
  res.json(result.rows);
};

exports.obtenerMateriasPorGrupo = async (req, res) => {
  const { grupo_id } = req.params;
  const result = await pool.query(`
    SELECT 
      gm.*,
      m.nombre AS materia_nombre,
      u.nombre AS maestro_nombre
    FROM grupo_materias gm
    JOIN materias m ON gm.materia_id = m.id
    JOIN usuarios u ON gm.maestro_id = u.id
    WHERE gm.grupo_id = $1
    ORDER BY m.nombre
  `, [grupo_id]);
  res.json(result.rows);
};

exports.eliminarGrupoMateria = async (req, res) => {
  const { id } = req.params;
  await pool.query(`DELETE FROM grupo_materias WHERE id=$1`, [id]);
  res.json({ message: 'Materia eliminada del grupo' });
};