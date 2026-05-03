const supabase = require('../../config/supabase');

exports.crearGrupo = async (req, res) => {
  try {
    const { nivel_academico_id, ciclo_escolar_id, maestro_id, nombre } = req.body;

    const { data, error } = await supabase
      .from('grupos')
      .insert({ nivel_academico_id, ciclo_escolar_id, maestro_id, nombre })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando grupo' });
  }
};

exports.obtenerGrupos = async (req, res) => {
  try {
    const { id: usuario_id, rol } = req.user;

    let query = supabase
      .from('grupos')
      .select(`
        *,
        niveles_academicos (nombre, orden, niveles_educativos (nombre)),
        ciclos_escolares (nombre)
      `)
      .order('id');

    // Maestro solo ve sus propios grupos
    if (rol !== 'admin') {
      query = query.eq('maestro_id', usuario_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    const result = data.map(g => ({
      ...g,
      nivel_academico: g.niveles_academicos?.nombre,
      nivel_educativo: g.niveles_academicos?.niveles_educativos?.nombre,
      ciclo_escolar: g.ciclos_escolares?.nombre,
      niveles_academicos: undefined,
      ciclos_escolares: undefined
    }));

    res.json(result);
  } catch (error) {
    console.error('ERROR GRUPOS:', JSON.stringify(error, null, 2));
    res.status(500).json({ message: 'Error obteniendo grupos', detail: error });
  }
};

exports.obtenerGrupoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: usuario_id, rol } = req.user;

    let query = supabase
      .from('grupos')
      .select('*')
      .eq('id', id);

    // Maestro solo puede ver sus propios grupos
    if (rol !== 'admin') {
      query = query.eq('maestro_id', usuario_id);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return res.status(404).json({ message: 'Grupo no encontrado' });
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo grupo' });
  }
};

exports.actualizarGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, maestro_id } = req.body;

    const { data, error } = await supabase
      .from('grupos')
      .update({ nombre, maestro_id })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando grupo' });
  }
};

exports.eliminarGrupo = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('grupos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Grupo eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando grupo' });
  }
};