const supabase = require('../../config/supabase');

exports.configurarEvaluacion = async (req, res) => {
  try {
    const { grupo_id, tipo_evaluacion, num_periodos, tipo_periodo, tipo_calculo } = req.body;

    // Verifica que el grupo no tenga ya configuración
    const { data: existe } = await supabase
      .from('configuraciones_evaluacion')
      .select('id')
      .eq('grupo_id', grupo_id);

    if (existe && existe.length > 0) {
      return res.status(400).json({ message: 'Este grupo ya tiene una configuración de evaluación' });
    }

    const { data, error } = await supabase
      .from('configuraciones_evaluacion')
      .insert({ grupo_id, tipo_evaluacion, num_periodos, tipo_periodo, tipo_calculo })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error configurando evaluación' });
  }
};

exports.obtenerEvaluaciones = async (req, res) => {
  try {
    const { id: usuario_id, rol } = req.user;

    // Usamos RPC para la query con JOINs y filtro condicional por rol
    const { data, error } = await supabase.rpc('obtener_evaluaciones', {
      p_usuario_id: usuario_id,
      p_rol: rol
    });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo evaluaciones' });
  }
};

exports.obtenerEvaluacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('configuraciones_evaluacion')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Evaluación no encontrada' });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo evaluación' });
  }
};

exports.actualizarEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_evaluacion, num_periodos, tipo_periodo, tipo_calculo } = req.body;

    const { data, error } = await supabase
      .from('configuraciones_evaluacion')
      .update({ tipo_evaluacion, num_periodos, tipo_periodo, tipo_calculo })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando evaluación' });
  }
};

exports.eliminarEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('configuraciones_evaluacion')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Evaluación eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando evaluación' });
  }
};