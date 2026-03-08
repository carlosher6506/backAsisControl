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