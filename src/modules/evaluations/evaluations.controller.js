const pool = require('../../config/database');

exports.configurarEvaluacion = async (req, res) => {
  const { grupo_id, tipo_evaluacion, num_periodos, tipo_periodo, tipo_calculo } = req.body;

  // Verifica que el grupo no tenga ya configuración
  const existe = await pool.query(
    `SELECT id FROM configuraciones_evaluacion WHERE grupo_id = $1`,
    [grupo_id]
  );
  if (existe.rows.length > 0) {
    return res.status(400).json({ message: 'Este grupo ya tiene una configuración de evaluación' });
  }

  const result = await pool.query(`
    INSERT INTO configuraciones_evaluacion
    (grupo_id, tipo_evaluacion, num_periodos, tipo_periodo, tipo_calculo)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [grupo_id, tipo_evaluacion, num_periodos, tipo_periodo, tipo_calculo]);

  res.json(result.rows[0]);
};

exports.obtenerEvaluaciones = async (req, res) => {
  try {
    const { id: usuario_id, rol } = req.user; // viene del middleware auth

    let query;
    let params;

    if (rol === 'admin') {
      query = `
        SELECT 
          ce.*,
          g.nombre AS grupo_nombre,
          na.nombre AS nivel_academico,
          ne.nombre AS nivel_educativo
        FROM configuraciones_evaluacion ce
        JOIN grupos g ON ce.grupo_id = g.id
        JOIN niveles_academicos na ON g.nivel_academico_id = na.id
        JOIN niveles_educativos ne ON na.nivel_educativo_id = ne.id
        ORDER BY ce.id
      `;
      params = [];
    } else {
      // Maestro solo ve sus grupos
      query = `
        SELECT 
          ce.*,
          g.nombre AS grupo_nombre,
          na.nombre AS nivel_academico,
          ne.nombre AS nivel_educativo
        FROM configuraciones_evaluacion ce
        JOIN grupos g ON ce.grupo_id = g.id
        JOIN niveles_academicos na ON g.nivel_academico_id = na.id
        JOIN niveles_educativos ne ON na.nivel_educativo_id = ne.id
        WHERE g.maestro_id = $1
        ORDER BY ce.id
      `;
      params = [usuario_id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo evaluaciones' });
  }
};

exports.obtenerEvaluacionPorId = async (req,res)=>{

    const {id} = req.params;

    const result = await pool.query(`
        SELECT *
        FROM configuraciones_evaluacion
        WHERE id=$1
    `,[id]);

    if(result.rows.length === 0){
        return res.status(404).json({message:"Evaluación no encontrada"});
    }

    res.json(result.rows[0]);

};

exports.actualizarEvaluacion = async (req, res) => {
  const { id } = req.params;
  const { tipo_evaluacion, num_periodos, tipo_periodo, tipo_calculo } = req.body;

  const result = await pool.query(`
    UPDATE configuraciones_evaluacion
    SET tipo_evaluacion = $1,
        num_periodos    = $2,
        tipo_periodo    = $3,
        tipo_calculo    = $4
    WHERE id = $5
    RETURNING *
  `, [tipo_evaluacion, num_periodos, tipo_periodo, tipo_calculo, id]);

  res.json(result.rows[0]);
};

exports.eliminarEvaluacion = async (req,res)=>{

    const {id} = req.params;

    await pool.query(`
        DELETE FROM configuraciones_evaluacion
        WHERE id=$1
    `,[id]);

    res.json({message:"Evaluación eliminada"});

};

