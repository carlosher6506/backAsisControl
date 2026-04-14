const pool = require('../../config/database');

exports.crearEtiqueta = async (req, res) => {
  try {
    const { configuracion_id, nombre, valor_total } = req.body;

    const result = await pool.query(`
      INSERT INTO etiquetas (configuracion_id, nombre, valor_total)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [configuracion_id, nombre, valor_total]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creando etiqueta' });
  }
};

exports.obtenerEtiquetas = async (req, res) => {
  const result = await pool.query(`
    SELECT e.*, ce.grupo_id, ce.tipo_evaluacion
    FROM etiquetas e
    JOIN configuraciones_evaluacion ce ON e.configuracion_id = ce.id
    ORDER BY e.id
  `);
  res.json(result.rows);
};

exports.obtenerEtiquetasPorConfiguracion = async (req, res) => {
  const { configuracion_id } = req.params;
  const result = await pool.query(`
    SELECT * FROM etiquetas
    WHERE configuracion_id = $1
    ORDER BY id
  `, [configuracion_id]);
  res.json(result.rows);
};

exports.actualizarEtiqueta = async (req, res) => {
  const { id } = req.params;
  const { nombre, valor_total } = req.body;
  const result = await pool.query(`
    UPDATE etiquetas SET nombre=$1, valor_total=$2
    WHERE id=$3 RETURNING *
  `, [nombre, valor_total, id]);
  res.json(result.rows[0]);
};

exports.eliminarEtiqueta = async (req, res) => {
  const { id } = req.params;
  await pool.query(`DELETE FROM etiquetas WHERE id=$1`, [id]);
  res.json({ message: 'Etiqueta eliminada' });
};