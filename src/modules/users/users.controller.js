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

exports.obtenerUsuarios = async (req,res)=>{

    const result = await pool.query(`
        SELECT u.id,u.nombre,u.email,r.nombre as rol
        FROM usuarios u
        JOIN roles r ON u.rol_id=r.id
    `);

    res.json(result.rows);
};

exports.obtenerUsuarioPorId = async (req,res)=>{

    const {id} = req.params;

    const result = await pool.query(`
        SELECT 
        u.id,
        u.nombre,
        u.email,
        r.nombre AS rol
        FROM usuarios u
        JOIN roles r
        ON u.rol_id = r.id
        WHERE u.id=$1
    `,[id]);

    if(result.rows.length === 0){
        return res.status(404).json({message:"Usuario no encontrado"});
    }

    res.json(result.rows[0]);

};


exports.eliminarUsuario = async (req,res)=>{

    const {id} = req.params;

    await pool.query(`
        DELETE FROM usuarios
        WHERE id=$1
    `,[id]);

    res.json({message:"Usuario eliminado"});
};

exports.actualizarUsuario = async (req,res)=>{

    try{

        const {id} = req.params;
        const {nombre,email,rol} = req.body;

        const rolQuery = await pool.query(
            "SELECT id FROM roles WHERE nombre=$1",
            [rol]
        );

        if(rolQuery.rows.length === 0){
            return res.status(400).json({message:"Rol inválido"});
        }

        const result = await pool.query(`
            UPDATE usuarios
            SET nombre=$1,
                email=$2,
                rol_id=$3
            WHERE id=$4
            RETURNING id,nombre,email
        `,[
            nombre,
            email,
            rolQuery.rows[0].id,
            id
        ]);

        res.json(result.rows[0]);

    }catch(error){

        console.error(error);
        res.status(500).json({message:"Error actualizando usuario"});

    }

};