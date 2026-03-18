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

exports.obtenerAlumnos = async (req, res) => {
  const result = await pool.query(`
    SELECT 
      a.id,
      a.nombre,
      a.matricula,
      a.grupo_id,
      g.nombre AS grupo_nombre,
      na.nombre AS nivel_academico,
      ne.nombre AS nivel_educativo,
      ce.nombre AS ciclo_escolar
    FROM alumnos a
    JOIN grupos g ON a.grupo_id = g.id
    JOIN niveles_academicos na ON g.nivel_academico_id = na.id
    JOIN niveles_educativos ne ON na.nivel_educativo_id = ne.id
    JOIN ciclos_escolares ce ON g.ciclo_escolar_id = ce.id
    ORDER BY a.id
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

// Obtener alumnos por grupo
exports.obtenerAlumnosPorGrupo = async (req, res) => {
  const { grupo_id } = req.params;
  const result = await pool.query(`
    SELECT id, nombre, matricula, grupo_id
    FROM alumnos
    WHERE grupo_id = $1
    ORDER BY nombre
  `, [grupo_id]);
  res.json(result.rows);
};