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

exports.obtenerCalificaciones = async (req,res)=>{

    const result = await pool.query(`
        SELECT * FROM calificaciones
    `);

    res.json(result.rows);
};


exports.obtenerCalificacion = async (req,res)=>{

    const {id} = req.params;

    const result = await pool.query(`
        SELECT * FROM calificaciones
        WHERE id=$1
    `,[id]);

    res.json(result.rows[0]);
};


exports.eliminarCalificacion = async (req,res)=>{

    const {id} = req.params;

    await pool.query(`
        DELETE FROM calificaciones
        WHERE id=$1
    `,[id]);

    res.json({message:"Calificación eliminada"});
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