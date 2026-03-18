const pool = require('../../config/database');

exports.crearNivelAcademico = async (req, res) => {
  try {
    const { nivel_educativo_id, nombre, orden } = req.body;

    // Verifica si ya existe el mismo nombre en el mismo nivel
    const existe = await pool.query(`
      SELECT id FROM niveles_academicos
      WHERE nivel_educativo_id = $1
      AND LOWER(nombre) = LOWER($2)
    `, [nivel_educativo_id, nombre]);

    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe ese grado/semestre en este nivel' });
    }

    const result = await pool.query(`
      INSERT INTO niveles_academicos (nivel_educativo_id, nombre, orden)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [nivel_educativo_id, nombre, orden]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando nivel académico' });
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


exports.actualizarNivelAcademico = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, orden, nivel_educativo_id } = req.body;

    // Verifica duplicado — excluye el registro actual
    const existe = await pool.query(`
      SELECT id FROM niveles_academicos
      WHERE nivel_educativo_id = $1
      AND LOWER(nombre) = LOWER($2)
      AND id != $3
    `, [nivel_educativo_id, nombre, id]);

    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'Ya existe ese grado/semestre en este nivel' });
    }

    const result = await pool.query(`
      UPDATE niveles_academicos
      SET nombre = $1,
          orden = $2,
          nivel_educativo_id = $3
      WHERE id = $4
      RETURNING *
    `, [nombre, orden, nivel_educativo_id, id]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando nivel académico' });
  }
};


exports.eliminarNivelAcademico = async (req,res)=>{

    const {id} = req.params;

    await pool.query(`
        DELETE FROM niveles_academicos
        WHERE id=$1
    `,[id]);

    res.json({message:"Nivel académico eliminado"});
};