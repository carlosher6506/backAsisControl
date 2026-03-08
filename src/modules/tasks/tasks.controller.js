const pool = require('../../config/database');

exports.crearTarea = async (req,res)=>{

    const {etiqueta_id,nombre,fecha} = req.body;

    const result = await pool.query(`
        INSERT INTO tareas
        (etiqueta_id,nombre,fecha)
        VALUES ($1,$2,$3)
        RETURNING *
    `,[etiqueta_id,nombre,fecha]);

    res.json(result.rows[0]);

};