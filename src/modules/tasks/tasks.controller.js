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

exports.obtenerTareas = async (req,res)=>{

    const result = await pool.query(`
        SELECT * FROM tareas
        ORDER BY id
    `);

    res.json(result.rows);
};


exports.obtenerTareaPorId = async (req,res)=>{

    const {id} = req.params;

    const result = await pool.query(`
        SELECT * FROM tareas
        WHERE id=$1
    `,[id]);

    res.json(result.rows[0]);
};


exports.eliminarTarea = async (req,res)=>{

    const {id} = req.params;

    await pool.query(`
        DELETE FROM tareas
        WHERE id=$1
    `,[id]);

    res.json({message:"Tarea eliminada"});
};

exports.actualizarTarea = async (req,res)=>{

    const {id} = req.params;

    const {etiqueta_id,nombre,fecha} = req.body;

    const result = await pool.query(`
        UPDATE tareas
        SET etiqueta_id=$1,
            nombre=$2,
            fecha=$3
        WHERE id=$4
        RETURNING *
    `,[etiqueta_id,nombre,fecha,id]);

    res.json(result.rows[0]);

};