const pool = require('../../config/database');

exports.calificar = async (req, res) => {
  try {
    const { alumno_id, tarea_id, calificacion, puntos_obtenidos } = req.body;

    // Solo convierte 0-100 a 0-10, SIN aplicar regla del 5
    // El redondeo final se aplica solo en la boleta
    const calificacionConvertida = calificacion !== null && calificacion !== undefined
      ? Math.round((calificacion / 10) * 100) / 100  // mantiene 2 decimales
      : null;

    const result = await pool.query(`
      INSERT INTO calificaciones (alumno_id, tarea_id, calificacion, puntos_obtenidos)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (alumno_id, tarea_id)
      DO UPDATE SET 
        calificacion = EXCLUDED.calificacion,
        puntos_obtenidos = EXCLUDED.puntos_obtenidos
      RETURNING *
    `, [alumno_id, tarea_id, calificacionConvertida, puntos_obtenidos || null]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error calificar:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.obtenerCalificaciones = async (req, res) => {
  const result = await pool.query(`
    SELECT 
      c.*,
      a.nombre AS alumno_nombre,
      t.nombre AS tarea_nombre,
      t.periodo,
      t.etiqueta_id,
      e.nombre AS etiqueta_nombre,
      e.valor_total,
      gm.grupo_id,
      gm.materia_id
    FROM calificaciones c
    JOIN alumnos a ON c.alumno_id = a.id
    JOIN tareas t ON c.tarea_id = t.id
    JOIN grupo_materias gm ON t.grupo_materia_id = gm.id
    LEFT JOIN etiquetas e ON t.etiqueta_id = e.id
    ORDER BY c.id
  `);
  res.json(result.rows);
};

exports.obtenerCalificacionesPorAlumno = async (req, res) => {
  const { alumno_id, grupo_materia_id } = req.params;

  const result = await pool.query(`
    WITH tareas_con_valor AS (
      SELECT 
        t.id AS tarea_id,        
        t.nombre AS tarea_nombre,
        t.periodo,
        t.fecha,
        t.etiqueta_id,
        t.valor_propio,
        e.nombre AS etiqueta_nombre,
        e.valor_total,
        COALESCE((
          SELECT SUM(t2.valor_propio) 
          FROM tareas t2 
          WHERE t2.etiqueta_id = t.etiqueta_id 
          AND t2.grupo_materia_id = t.grupo_materia_id
          AND t2.valor_propio IS NOT NULL
        ), 0) AS puntos_asignados,
        (
          SELECT COUNT(*) 
          FROM tareas t2 
          WHERE t2.etiqueta_id = t.etiqueta_id 
          AND t2.grupo_materia_id = t.grupo_materia_id
          AND t2.valor_propio IS NULL
        ) AS tareas_sin_valor
      FROM tareas t
      LEFT JOIN etiquetas e ON t.etiqueta_id = e.id
      WHERE t.grupo_materia_id = $2
    )
    SELECT 
      tv.*,
      CASE
        WHEN tv.valor_propio IS NOT NULL THEN tv.valor_propio
        WHEN tv.valor_total IS NOT NULL AND tv.tareas_sin_valor > 0 THEN
          ROUND(
            (tv.valor_total - tv.puntos_asignados) / tv.tareas_sin_valor
          , 2)
        ELSE NULL
      END AS valor_tarea,
      c.id AS calificacion_id,
      c.calificacion,
      c.puntos_obtenidos
    FROM tareas_con_valor tv
    LEFT JOIN calificaciones c ON tv.tarea_id = c.tarea_id AND c.alumno_id = $1
    ORDER BY tv.periodo, tv.etiqueta_id, tv.fecha
  `, [alumno_id, grupo_materia_id]);

  res.json(result.rows);
};

exports.eliminarCalificacion = async (req, res) => {
  const { id } = req.params;
  await pool.query(`DELETE FROM calificaciones WHERE id=$1`, [id]);
  res.json({ message: 'Calificación eliminada' });
};


exports.actualizarCalificacion = async (req,res)=>{

    const {id} = req.params;
    const {calificacion} = req.body;

    const result = await pool.query(`
        UPDATE calificaciones
        SET calificacion=$1
        WHERE id=$2
        RETURNING *
    `,[calificacion,id]);

    res.json(result.rows[0]);

};

exports.obtenerBoleta = async (req, res) => {
  const { alumno_id } = req.params;

  try {
    // Info del alumno
    const alumnoResult = await pool.query(`
      SELECT 
        a.*,
        g.nombre AS grupo_nombre,
        na.nombre AS nivel_academico,
        ne.nombre AS nivel_educativo,
        ce.nombre AS ciclo_escolar,
        ce.fecha_inicio,
        ce.fecha_fin
      FROM alumnos a
      LEFT JOIN grupos g ON a.grupo_id = g.id
      LEFT JOIN niveles_academicos na ON g.nivel_academico_id = na.id
      LEFT JOIN niveles_educativos ne ON na.nivel_educativo_id = ne.id
      LEFT JOIN ciclos_escolares ce ON g.ciclo_escolar_id = ce.id
      WHERE a.id = $1
    `, [alumno_id]);

    if (alumnoResult.rows.length === 0) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }

    // Calificaciones por materia y periodo
    const calResult = await pool.query(`
      SELECT
        m.nombre AS materia_nombre,
        t.periodo,
        ce2.tipo_evaluacion,
        ce2.tipo_calculo,
        ce2.num_periodos,
        ce2.tipo_periodo,
        ne.calificacion_minima_aprobatoria,
        ne.forzar_minimo,
        -- Por promedio: promedio de calificaciones
        ROUND(AVG(c.calificacion)::numeric, 2) AS promedio_calificaciones,
        -- Por puntos: suma de puntos obtenidos / suma de valor_tarea * 10
        SUM(c.puntos_obtenidos) AS total_puntos_obtenidos,
        SUM(
          CASE 
            WHEN t.valor_propio IS NOT NULL THEN t.valor_propio
            WHEN e.valor_total IS NOT NULL THEN
              ROUND(
                e.valor_total / NULLIF(
                  (SELECT COUNT(*) FROM tareas t3 
                  WHERE t3.etiqueta_id = t.etiqueta_id 
                  AND t3.grupo_materia_id = t.grupo_materia_id), 0
                ), 2
              )
            ELSE 0
          END
        ) AS total_puntos_posibles
      FROM tareas t
      JOIN grupo_materias gm ON t.grupo_materia_id = gm.id
      JOIN materias m ON gm.materia_id = m.id
      JOIN grupos g ON gm.grupo_id = g.id
      JOIN niveles_educativos ne ON 
        (SELECT ne2.id FROM niveles_academicos na2 
         JOIN niveles_educativos ne2 ON na2.nivel_educativo_id = ne2.id
         WHERE na2.id = g.nivel_academico_id) = ne.id
      JOIN configuraciones_evaluacion ce2 ON ce2.grupo_id = g.id
      LEFT JOIN etiquetas e ON t.etiqueta_id = e.id
      LEFT JOIN calificaciones c ON t.id = c.tarea_id AND c.alumno_id = $1
      WHERE gm.grupo_id = (SELECT grupo_id FROM alumnos WHERE id = $1)
      GROUP BY m.nombre, t.periodo, ce2.tipo_evaluacion, ce2.tipo_calculo,
               ce2.num_periodos, ce2.tipo_periodo,
               ne.calificacion_minima_aprobatoria, ne.forzar_minimo
      ORDER BY m.nombre, t.periodo
    `, [alumno_id]);

    res.json({
      alumno: alumnoResult.rows[0],
      calificaciones: calResult.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generando boleta' });
  }
};