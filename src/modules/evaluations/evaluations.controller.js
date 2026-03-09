const pool = require('../../config/database');

exports.configurarEvaluacion = async (req,res)=>{

    const {grupo_id,tipo_evaluacion} = req.body;

    const result = await pool.query(`
        INSERT INTO configuraciones_evaluacion
        (grupo_id,tipo_evaluacion)
        VALUES ($1,$2)
        RETURNING *
    `,[grupo_id,tipo_evaluacion]);

    res.json(result.rows[0]);

};

exports.obtenerEvaluaciones = async (req,res)=>{

    const result = await pool.query(`
        SELECT * FROM configuraciones_evaluacion
        ORDER BY id
    `);

    res.json(result.rows);

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

exports.actualizarEvaluacion = async (req,res)=>{

    const {id} = req.params;

    const {grupo_id,tipo_evaluacion} = req.body;

    const result = await pool.query(`
        UPDATE configuraciones_evaluacion
        SET grupo_id=$1,
            tipo_evaluacion=$2
        WHERE id=$3
        RETURNING *
    `,[grupo_id,tipo_evaluacion,id]);

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

