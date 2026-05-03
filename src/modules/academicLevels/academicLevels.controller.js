const supabase = require('../../config/supabase');

exports.crearNivelAcademico = async (req, res) => {
  try {
    const { nivel_educativo_id, nombre, orden } = req.body;

    // Verifica si ya existe el mismo nombre en el mismo nivel
    const { data: existe } = await supabase
      .from('niveles_academicos')
      .select('id')
      .eq('nivel_educativo_id', nivel_educativo_id)
      .ilike('nombre', nombre);

    if (existe && existe.length > 0) {
      return res.status(400).json({ message: 'Ya existe ese grado/semestre en este nivel' });
    }

    const { data, error } = await supabase
      .from('niveles_academicos')
      .insert({ nivel_educativo_id, nombre, orden })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando nivel académico' });
  }
};

exports.obtenerNivelesAcademicos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('niveles_academicos')
      .select(`
        *,
        niveles_educativos (nombre)
      `)
      .order('orden');

    if (error) throw error;

    // Aplanar para que nivel_educativo quede como campo directo
    const result = data.map(n => ({
      ...n,
      nivel_educativo: n.niveles_educativos?.nombre,
      niveles_educativos: undefined
    }));

    res.json(result);
    } catch (error) {
      console.error('ERROR GRUPOS:', JSON.stringify(error, null, 2));
      res.status(500).json({ message: 'Error obteniendo niveles academicos', detail: error });
    }
};

exports.obtenerNivelAcademicoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('niveles_academicos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Nivel no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo nivel académico' });
  }
};

exports.actualizarNivelAcademico = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, orden, nivel_educativo_id } = req.body;

    // Verifica duplicado excluyendo el registro actual
    const { data: existe } = await supabase
      .from('niveles_academicos')
      .select('id')
      .eq('nivel_educativo_id', nivel_educativo_id)
      .ilike('nombre', nombre)
      .neq('id', id);

    if (existe && existe.length > 0) {
      return res.status(400).json({ message: 'Ya existe ese grado/semestre en este nivel' });
    }

    const { data, error } = await supabase
      .from('niveles_academicos')
      .update({ nombre, orden, nivel_educativo_id })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando nivel académico' });
  }
};

exports.eliminarNivelAcademico = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('niveles_academicos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Nivel académico eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando nivel académico' });
  }
};