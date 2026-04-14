const pool = require('../../config/database');

exports.crearAlumno = async (req,res)=>{

    const {grupo_id,nombre,matricula} = req.body;

    const result = await pool.query(`
        INSERT INTO alumnos
        (grupo_id,nombre,matricula)
        VALUES ($1,$2,$3)
        RETURNING *
    `,[grupo_id,nombre,matricula]);

    res.json(result.rows[0]);

};

exports.obtenerAlumnos = async (req, res) => {
  const { id: usuario_id, rol } = req.user;

  let query;
  let params;

  if (rol === 'admin') {
    query = `
      SELECT 
        a.id, a.nombre, a.matricula, a.grupo_id,
        g.nombre AS grupo_nombre,
        na.nombre AS nivel_academico,
        ne.nombre AS nivel_educativo,
        ce.nombre AS ciclo_escolar
      FROM alumnos a
      LEFT JOIN grupos g ON a.grupo_id = g.id
      LEFT JOIN niveles_academicos na ON g.nivel_academico_id = na.id
      LEFT JOIN niveles_educativos ne ON na.nivel_educativo_id = ne.id
      LEFT JOIN ciclos_escolares ce ON g.ciclo_escolar_id = ce.id
      ORDER BY a.id
    `;
    params = [];
  } else {
    // Maestro solo ve alumnos de sus grupos
    query = `
      SELECT 
        a.id, a.nombre, a.matricula, a.grupo_id,
        g.nombre AS grupo_nombre,
        na.nombre AS nivel_academico,
        ne.nombre AS nivel_educativo,
        ce.nombre AS ciclo_escolar
      FROM alumnos a
      LEFT JOIN grupos g ON a.grupo_id = g.id
      LEFT JOIN niveles_academicos na ON g.nivel_academico_id = na.id
      LEFT JOIN niveles_educativos ne ON na.nivel_educativo_id = ne.id
      LEFT JOIN ciclos_escolares ce ON g.ciclo_escolar_id = ce.id
      WHERE g.maestro_id = $1
      ORDER BY a.id
    `;
    params = [usuario_id];
  }

  const result = await pool.query(query, params);
  res.json(result.rows);
};

exports.obtenerAlumnoPorId = async (req,res)=>{

    const {id} = req.params;

    const result = await pool.query(`
        SELECT * FROM alumnos
        WHERE id=$1
    `,[id]);

    res.json(result.rows[0]);
};


exports.actualizarAlumno = async (req,res)=>{

    const {id} = req.params;
    const {nombre} = req.body;

    const result = await pool.query(`
        UPDATE alumnos
        SET nombre=$1
        WHERE id=$2
        RETURNING *
    `,[nombre,id]);

    res.json(result.rows[0]);
};


exports.eliminarAlumno = async (req,res)=>{

    const {id} = req.params;

    await pool.query(`
        DELETE FROM alumnos
        WHERE id=$1
    `,[id]);

    res.json({message:"Alumno eliminado"});
};

// Obtener alumnos por grupo
exports.obtenerAlumnosPorGrupo = async (req, res) => {
  const { grupo_id } = req.params;
  const result = await pool.query(`
    SELECT id, nombre, matricula, grupo_id
    FROM alumnos
    WHERE grupo_id = $1
    ORDER BY nombre
  `, [grupo_id]);
  res.json(result.rows);
};


exports.consultarPorMatricula = async (req, res) => {
  try {
    const { matricula } = req.params;

    // Busca el alumno
    const alumnoResult = await pool.query(`
      SELECT 
        a.id, a.nombre, a.matricula,
        g.nombre AS grupo_nombre,
        na.nombre AS nivel_academico,
        ne.nombre AS nivel_educativo,
        ce.nombre AS ciclo_escolar
      FROM alumnos a
      LEFT JOIN grupos g ON a.grupo_id = g.id
      LEFT JOIN niveles_academicos na ON g.nivel_academico_id = na.id
      LEFT JOIN niveles_educativos ne ON na.nivel_educativo_id = ne.id
      LEFT JOIN ciclos_escolares ce ON g.ciclo_escolar_id = ce.id
      WHERE a.matricula = $1
    `, [matricula]);

    if (alumnoResult.rows.length === 0) {
      return res.status(404).json({ message: 'Matrícula no encontrada' });
    }

    const alumno = alumnoResult.rows[0];

    // Calificaciones por materia y periodo
    const calResult = await pool.query(`
      SELECT
        m.nombre AS materia_nombre,
        t.periodo,
        ce2.tipo_evaluacion,
        ce2.tipo_periodo,
        ce2.num_periodos,
        ne.calificacion_minima_aprobatoria,
        ne.forzar_minimo,
        ROUND(AVG(c.calificacion) FILTER (WHERE c.calificacion IS NOT NULL)::numeric, 2)
          AS promedio_calificaciones,
        COALESCE(SUM(c.puntos_obtenidos) FILTER (WHERE c.puntos_obtenidos IS NOT NULL), 0)
          AS total_puntos_obtenidos,
        COALESCE(SUM(
          CASE
            WHEN t.valor_propio IS NOT NULL THEN t.valor_propio
            WHEN e.valor_total IS NOT NULL THEN
              ROUND((e.valor_total - COALESCE((
                SELECT SUM(t3.valor_propio) FROM tareas t3
                WHERE t3.etiqueta_id = t.etiqueta_id
                AND t3.grupo_materia_id = t.grupo_materia_id
                AND t3.periodo = t.periodo
                AND t3.valor_propio IS NOT NULL
              ), 0)) / NULLIF((
                SELECT COUNT(*) FROM tareas t3
                WHERE t3.etiqueta_id = t.etiqueta_id
                AND t3.grupo_materia_id = t.grupo_materia_id
                AND t3.periodo = t.periodo
                AND t3.valor_propio IS NULL
              ), 0), 2)
            ELSE 0
          END
        ), 0) AS total_puntos_posibles
      FROM tareas t
      JOIN grupo_materias gm ON t.grupo_materia_id = gm.id
      JOIN materias m ON gm.materia_id = m.id
      JOIN grupos g ON gm.grupo_id = g.id
      JOIN niveles_academicos na2 ON g.nivel_academico_id = na2.id
      JOIN niveles_educativos ne ON na2.nivel_educativo_id = ne.id
      JOIN configuraciones_evaluacion ce2 ON ce2.grupo_id = g.id
      LEFT JOIN etiquetas e ON t.etiqueta_id = e.id
      LEFT JOIN calificaciones c ON t.id = c.tarea_id AND c.alumno_id = $1
      WHERE gm.grupo_id = (SELECT grupo_id FROM alumnos WHERE id = $1)
      GROUP BY m.nombre, t.periodo, ce2.tipo_evaluacion, ce2.tipo_periodo,
               ce2.num_periodos, ne.calificacion_minima_aprobatoria, ne.forzar_minimo
      ORDER BY m.nombre, t.periodo
    `, [alumno.id]);

    res.json({ alumno, calificaciones: calResult.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error consultando calificaciones' });
  }
};