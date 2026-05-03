const supabase = require('../../config/supabase');

exports.crearCiclo = async (req, res) => {
  try {
    const { nombre, fecha_inicio, fecha_fin } = req.body;

    const { data, error } = await supabase
      .from('ciclos_escolares')
      .insert({ nombre, fecha_inicio, fecha_fin })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando ciclo escolar' });
  }
};

exports.obtenerCiclos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ciclos_escolares')
      .select('*')
      .order('id');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo ciclos escolares' });
  }
};

exports.obtenerCiclo = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('ciclos_escolares')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Ciclo no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo ciclo escolar' });
  }
};

exports.eliminarCiclo = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('ciclos_escolares')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Ciclo eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando ciclo escolar' });
  }
};

exports.actualizarCiclo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, fecha_inicio, fecha_fin } = req.body;

    const { data, error } = await supabase
      .from('ciclos_escolares')
      .update({ nombre, fecha_inicio, fecha_fin })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando ciclo escolar' });
  }
};

exports.activarCiclo = async (req, res) => {
  try {
    const { id } = req.params;

    // Desactiva todos primero
    const { error: errorDesactivar } = await supabase
      .from('ciclos_escolares')
      .update({ activo: false })
      .neq('id', 0); // Aplica a todos los registros

    if (errorDesactivar) throw errorDesactivar;

    // Activa solo el seleccionado
    const { data, error } = await supabase
      .from('ciclos_escolares')
      .update({ activo: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error activando ciclo escolar' });
  }
};