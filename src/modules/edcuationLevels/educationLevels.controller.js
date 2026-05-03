const supabase = require('../../config/supabase');

exports.crearNivelEducativo = async (req, res) => {
  try {
    const { nombre, tipo_estructura, calificacion_minima_aprobatoria, forzar_minimo } = req.body;

    const { data, error } = await supabase
      .from('niveles_educativos')
      .insert({ nombre, tipo_estructura, calificacion_minima_aprobatoria, forzar_minimo })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando nivel educativo' });
  }
};

exports.obtenerNiveles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('niveles_educativos')
      .select('*')
      .order('id');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo niveles educativos' });
  }
};

exports.obtenerNivelPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('niveles_educativos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Nivel no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo nivel educativo' });
  }
};

exports.actualizarNivel = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo_estructura, calificacion_minima_aprobatoria, forzar_minimo } = req.body;

    const { data, error } = await supabase
      .from('niveles_educativos')
      .update({ nombre, tipo_estructura, calificacion_minima_aprobatoria, forzar_minimo })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando nivel educativo' });
  }
};

exports.eliminarNivel = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('niveles_educativos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Nivel eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando nivel educativo' });
  }
};