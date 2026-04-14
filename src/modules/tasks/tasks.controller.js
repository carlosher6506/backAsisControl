const pool = require('../../config/database');

const verificarPuntosDisponibles = async (etiqueta_id, grupo_materia_id, valor_propio, periodo, tarea_id_excluir = null) => {
  if (!etiqueta_id || !valor_propio) return { valido: true };

  const etiqueta = await pool.query(
    `SELECT valor_total FROM etiquetas WHERE id = $1`,
    [etiqueta_id]
  );

  if (etiqueta.rows.length === 0) return { valido: true };

  const valorTotal = Number(etiqueta.rows[0].valor_total);

  // Suma solo los puntos del MISMO periodo
  const puntosAsignados = await pool.query(`
    SELECT COALESCE(SUM(valor_propio), 0) AS total
    FROM tareas
    WHERE etiqueta_id = $1
    AND grupo_materia_id = $2
    AND periodo = $3                          -- ← filtra por periodo
    AND valor_propio IS NOT NULL
    ${tarea_id_excluir ? 'AND id != $4' : ''}
  `, tarea_id_excluir
    ? [etiqueta_id, grupo_materia_id, periodo, tarea_id_excluir]
    : [etiqueta_id, grupo_materia_id, periodo]
  );

  const totalAsignado = Number(puntosAsignados.rows[0].total);
  const disponible = valorTotal - totalAsignado;

  if (valor_propio > disponible) {
    return {
      valido: false,
      mensaje: `Solo hay ${disponible} pts disponibles en este periodo para esta etiqueta (total: ${valorTotal}, asignados: ${totalAsignado})`
    };
  }

  return { valido: true };
};


exports.crearTarea = async (req, res) => {
  try {
    const { grupo_materia_id, nombre, fecha, periodo, etiqueta_id, valor_propio } = req.body;

    const validacion = await verificarPuntosDisponibles(
      etiqueta_id, grupo_materia_id, valor_propio, periodo  // ← agrega periodo
    );
    if (!validacion.valido) {
      return res.status(400).json({ message: validacion.mensaje });
    }

    const result = await pool.query(`
      INSERT INTO tareas (grupo_materia_id, nombre, fecha, periodo, etiqueta_id, valor_propio)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [grupo_materia_id, nombre, fecha, periodo, etiqueta_id || null, valor_propio || null]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando tarea' });
  }
};

exports.actualizarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, fecha, periodo, etiqueta_id, valor_propio } = req.body;

    const tareaActual = await pool.query(
      `SELECT grupo_materia_id FROM tareas WHERE id = $1`, [id]
    );

    const validacion = await verificarPuntosDisponibles(
      etiqueta_id,
      tareaActual.rows[0]?.grupo_materia_id,
      valor_propio,
      periodo,   // ← agrega periodo
      id
    );
    if (!validacion.valido) {
      return res.status(400).json({ message: validacion.mensaje });
    }

    const result = await pool.query(`
      UPDATE tareas
      SET nombre=$1, fecha=$2, periodo=$3, etiqueta_id=$4, valor_propio=$5
      WHERE id=$6 RETURNING *
    `, [nombre, fecha, periodo, etiqueta_id || null, valor_propio || null, id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando tarea' });
  }
};


exports.obtenerTareas = async (req, res) => {
  const result = await pool.query(`
    SELECT 
      t.*,
      e.nombre AS etiqueta_nombre,
      e.valor_total,
      m.nombre AS materia_nombre,
      g.nombre AS grupo_nombre,
      na.nombre AS nivel_academico,
      ne.nombre AS nivel_educativo
    FROM tareas t
    JOIN grupo_materias gm ON t.grupo_materia_id = gm.id
    JOIN materias m ON gm.materia_id = m.id
    JOIN grupos g ON gm.grupo_id = g.id
    JOIN niveles_academicos na ON g.nivel_academico_id = na.id
    JOIN niveles_educativos ne ON na.nivel_educativo_id = ne.id
    LEFT JOIN etiquetas e ON t.etiqueta_id = e.id  -- ← verifica que esté este LEFT JOIN
    ORDER BY t.id
  `);
  res.json(result.rows);
};  

exports.obtenerTareasPorGrupoMateria = async (req, res) => {
  const { grupo_materia_id } = req.params;
  const result = await pool.query(`
    SELECT * FROM tareas
    WHERE grupo_materia_id = $1
    ORDER BY periodo, fecha
  `, [grupo_materia_id]);
  res.json(result.rows);
};

exports.eliminarTarea = async (req, res) => {
  const { id } = req.params;
  await pool.query(`DELETE FROM tareas WHERE id=$1`, [id]);
  res.json({ message: 'Tarea eliminada' });
};