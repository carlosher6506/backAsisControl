const pool = require('../../config/database');
const bcrypt = require('bcrypt');

exports.crearUsuario = async (req,res)=>{

    try{

        const {nombre,email,password,rol} = req.body;

        const rolQuery = await pool.query(
            "SELECT id FROM roles WHERE nombre=$1",
            [rol]
        );

        if(rolQuery.rows.length === 0){
            return res.status(400).json({message:"Rol inválido"});
        }

        const passwordHash = await bcrypt.hash(password,10);

        const result = await pool.query(`
            INSERT INTO usuarios
            (nombre,email,password,rol_id)
            VALUES ($1,$2,$3,$4)
            RETURNING id,nombre,email
        `,[
            nombre,
            email,
            passwordHash,
            rolQuery.rows[0].id
        ]);

        res.json(result.rows[0]);

    }catch(error){

        console.error(error);
        res.status(500).json({message:"Error creando usuario"});

    }

};