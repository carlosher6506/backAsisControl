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