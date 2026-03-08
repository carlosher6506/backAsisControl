const pool = require('../../config/database');

exports.crearCiclo = async (req,res)=>{

    const {nombre,fecha_inicio,fecha_fin} = req.body;

    const result = await pool.query(`
        INSERT INTO ciclos_escolares
        (nombre,fecha_inicio,fecha_fin)
        VALUES ($1,$2,$3)
        RETURNING *
    `,[nombre,fecha_inicio,fecha_fin]);

    res.json(result.rows[0]);

};