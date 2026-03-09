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

exports.obtenerAlumnos = async (req,res)=>{

    const result = await pool.query(`
        SELECT * FROM alumnos
        ORDER BY id
    `);

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