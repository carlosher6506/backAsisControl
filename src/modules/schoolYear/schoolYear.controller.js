const pool = require('../../config/database');

exports.crearCiclo = async (req,res)=>{

    const {nombre,fecha_inicio,fecha_fin} = req.body;

    const result = await pool.query(`
        INSERT INTO ciclos_escolares
        (nombre,fecha_inicio,fecha_fin)
        VALUES ($1,$2,$3)
        RETURNING *
    `,[nombre,fecha_inicio,fecha_fin]);

    res.json(result.rows[0]);

};

exports.obtenerCiclos = async (req,res)=>{

    const result = await pool.query(`
        SELECT * FROM ciclos_escolares
        ORDER BY id
    `);

    res.json(result.rows);
};


exports.obtenerCiclo = async (req,res)=>{

    const {id} = req.params;

    const result = await pool.query(`
        SELECT * FROM ciclos_escolares
        WHERE id=$1
    `,[id]);

    res.json(result.rows[0]);
};


exports.eliminarCiclo = async (req,res)=>{

    const {id} = req.params;

    await pool.query(`
        DELETE FROM ciclos_escolares
        WHERE id=$1
    `,[id]);

    res.json({message:"Ciclo eliminado"});
};

exports.actualizarCiclo = async (req,res)=>{

    const {id} = req.params;

    const {nombre,fecha_inicio,fecha_fin} = req.body;

    const result = await pool.query(`
        UPDATE ciclos_escolares
        SET nombre=$1,
            fecha_inicio=$2,
            fecha_fin=$3
        WHERE id=$4
        RETURNING *
    `,[nombre,fecha_inicio,fecha_fin,id]);

    res.json(result.rows[0]);

};


exports.activarCiclo = async (req, res) => {
  const { id } = req.params;

  // Desactiva todos primero
  await pool.query(`UPDATE ciclos_escolares SET activo = false`);

  // Activa solo el seleccionado
  const result = await pool.query(`
    UPDATE ciclos_escolares
    SET activo = true
    WHERE id = $1
    RETURNING *
  `, [id]);

  res.json(result.rows[0]);
};