const supabase = require('../../config/supabase');

exports.crearEtiqueta = async (req, res) => {
  try {
    const { configuracion_id, nombre, valor_total } = req.body;

    const { data, error } = await supabase
      .from('etiquetas')
      .insert({ configuracion_id, nombre, valor_total })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando etiqueta' });
  }
};

exports.obtenerEtiquetas = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('etiquetas')
      .select(`
        *,
        configuraciones_evaluacion (grupo_id, tipo_evaluacion)
      `)
      .order('id');

    if (error) throw error;

    const result = data.map(e => ({
      ...e,
      grupo_id: e.configuraciones_evaluacion?.grupo_id,
      tipo_evaluacion: e.configuraciones_evaluacion?.tipo_evaluacion,
      configuraciones_evaluacion: undefined
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo etiquetas' });
  }
};

exports.obtenerEtiquetasPorConfiguracion = async (req, res) => {
  try {
    const { configuracion_id } = req.params;

    const { data, error } = await supabase
      .from('etiquetas')
      .select('*')
      .eq('configuracion_id', configuracion_id)
      .order('id');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo etiquetas por configuración' });
  }
};

exports.actualizarEtiqueta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, valor_total } = req.body;

    const { data, error } = await supabase
      .from('etiquetas')
      .update({ nombre, valor_total })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando etiqueta' });
  }
};

exports.eliminarEtiqueta = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('etiquetas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Etiqueta eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando etiqueta' });
  }
};