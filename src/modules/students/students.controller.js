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