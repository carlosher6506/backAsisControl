const pool = require('../../config/database');

exports.crearNivelEducativo = async (req,res)=>{
    try{

        const {
            nombre,
            tipo_estructura,
            calificacion_minima_aprobatoria,
            forzar_minimo
        } = req.body;

        const result = await pool.query(`
            INSERT INTO niveles_educativos
            (nombre,tipo_estructura,calificacion_minima_aprobatoria,forzar_minimo)
            VALUES ($1,$2,$3,$4)
            RETURNING *
        `,[
            nombre,
            tipo_estructura,
            calificacion_minima_aprobatoria,
            forzar_minimo
        ]);

        res.json(result.rows[0]);

    }catch(error){
        console.error(error);
        res.status(500).json({message:"Error creando nivel educativo"});
    }
};


exports.obtenerNiveles = async (req,res)=>{

    const result = await pool.query(`
        SELECT * FROM niveles_educativos
        ORDER BY id
    `);

    res.json(result.rows);
};


exports.obtenerNivelPorId = async (req,res)=>{

    const {id} = req.params;

    const result = await pool.query(`
        SELECT * FROM niveles_educativos
        WHERE id=$1
    `,[id]);

    if(result.rows.length === 0){
        return res.status(404).json({message:"Nivel no encontrado"});
    }

    res.json(result.rows[0]);
};


exports.actualizarNivel = async (req,res)=>{

    const {id} = req.params;

    const {
        nombre,
        tipo_estructura,
        calificacion_minima_aprobatoria,
        forzar_minimo
    } = req.body;

    const result = await pool.query(`
        UPDATE niveles_educativos
        SET nombre=$1,
            tipo_estructura=$2,
            calificacion_minima_aprobatoria=$3,
            forzar_minimo=$4
        WHERE id=$5
        RETURNING *
    `,[
        nombre,
        tipo_estructura,
        calificacion_minima_aprobatoria,
        forzar_minimo,
        id
    ]);

    res.json(result.rows[0]);
};


exports.eliminarNivel = async (req,res)=>{

    const {id} = req.params;

    await pool.query(`
        DELETE FROM niveles_educativos
        WHERE id=$1
    `,[id]);

    res.json({message:"Nivel eliminado"});
};