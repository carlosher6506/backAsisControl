const pool = require('../../config/database');

exports.crearGrupo = async (req,res)=>{

    try{

        const {
            nivel_academico_id,
            ciclo_escolar_id,
            maestro_id,
            nombre
        } = req.body;

        const result = await pool.query(`
            INSERT INTO grupos
            (nivel_academico_id,ciclo_escolar_id,maestro_id,nombre)
            VALUES ($1,$2,$3,$4)
            RETURNING *
        `,[
            nivel_academico_id,
            ciclo_escolar_id,
            maestro_id,
            nombre
        ]);

        res.json(result.rows[0]);

    }catch(error){

        res.status(500).json({message:"Error creando grupo"});

    }

};

exports.obtenerGrupos = async (req, res) => {
  const result = await pool.query(`
    SELECT 
      g.*,
      na.nombre AS nivel_academico,
      ne.nombre AS nivel_educativo,
      ce.nombre AS ciclo_escolar
    FROM grupos g
    JOIN niveles_academicos na ON g.nivel_academico_id = na.id
    JOIN niveles_educativos ne ON na.nivel_educativo_id = ne.id
    JOIN ciclos_escolares ce ON g.ciclo_escolar_id = ce.id
    ORDER BY ne.nombre, na.orden, g.nombre
  `);
  res.json(result.rows);
};


exports.obtenerGrupoPorId = async (req,res)=>{

    const {id} = req.params;

    const result = await pool.query(`
        SELECT * FROM grupos
        WHERE id=$1
    `,[id]);

    res.json(result.rows[0]);
};


exports.actualizarGrupo = async (req,res)=>{

    const {id} = req.params;
    const {nombre,maestro_id} = req.body;

    const result = await pool.query(`
        UPDATE grupos
        SET nombre=$1,maestro_id=$2
        WHERE id=$3
        RETURNING *
    `,[nombre,maestro_id,id]);

    res.json(result.rows[0]);   
};


exports.eliminarGrupo = async (req,res)=>{

    const {id} = req.params;

    await pool.query(`
        DELETE FROM grupos
        WHERE id=$1
    `,[id]);

    res.json({message:"Grupo eliminado"});
};