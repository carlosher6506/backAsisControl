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