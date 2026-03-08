const pool = require('../../config/database');

exports.calificar = async (req,res)=>{

    const {alumno_id,tarea_id,calificacion} = req.body;

    const result = await pool.query(`
        INSERT INTO calificaciones
        (alumno_id,tarea_id,calificacion)
        VALUES ($1,$2,$3)
        ON CONFLICT (alumno_id,tarea_id)
        DO UPDATE SET calificacion = EXCLUDED.calificacion
        RETURNING *
    `,[alumno_id,tarea_id,calificacion]);

    res.json(result.rows[0]);

};