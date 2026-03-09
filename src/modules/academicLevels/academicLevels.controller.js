const pool = require('../../config/database');

exports.crearNivelAcademico = async (req,res)=>{

    try{

        const {
            nivel_educativo_id,
            nombre,
            orden
        } = req.body;

        const result = await pool.query(`
            INSERT INTO niveles_academicos
            (nivel_educativo_id,nombre,orden)
            VALUES ($1,$2,$3)
            RETURNING *
        `,[
            nivel_educativo_id,
            nombre,
            orden
        ]);

        res.json(result.rows[0]);

    }catch(error){

        console.error(error);
        res.status(500).json({message:"Error creando nivel académico"});

    }

};


exports.obtenerNivelesAcademicos = async (req,res)=>{

    const result = await pool.query(`
        SELECT 
        na.*,
        ne.nombre AS nivel_educativo
        FROM niveles_academicos na
        JOIN niveles_educativos ne
        ON na.nivel_educativo_id = ne.id
        ORDER BY na.orden
    `);

    res.json(result.rows);

};

exports.obtenerNivelAcademicoPorId = async (req,res)=>{

    const {id} = req.params;

    const result = await pool.query(`
        SELECT * FROM niveles_academicos
        WHERE id=$1
    `,[id]);

    if(result.rows.length === 0){
        return res.status(404).json({message:"Nivel no encontrado"});
    }

    res.json(result.rows[0]);
};


exports.actualizarNivelAcademico = async (req,res)=>{

    const {id} = req.params;
    const {nombre,orden} = req.body;

    const result = await pool.query(`
        UPDATE niveles_academicos
        SET nombre=$1,orden=$2
        WHERE id=$3
        RETURNING *
    `,[nombre,orden,id]);

    res.json(result.rows[0]);
};


exports.eliminarNivelAcademico = async (req,res)=>{

    const {id} = req.params;

    await pool.query(`
        DELETE FROM niveles_academicos
        WHERE id=$1
    `,[id]);

    res.json({message:"Nivel académico eliminado"});
};