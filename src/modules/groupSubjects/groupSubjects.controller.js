const supabase = require('../../config/supabase');

exports.asignarMateria = async (req, res) => {
  try {
    const { grupo_id, materia_id, maestro_id } = req.body;

    const { data: existe } = await supabase
      .from('grupo_materias')
      .select('id')
      .eq('grupo_id', grupo_id)
      .eq('materia_id', materia_id);

    if (existe && existe.length > 0) {
      return res.status(400).json({ message: 'Esta materia ya está asignada a este grupo' });
    }

    const { data, error } = await supabase
      .from('grupo_materias')
      .insert({ grupo_id, materia_id, maestro_id })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error asignando materia' });
  }
};

exports.obtenerGrupoMaterias = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('grupo_materias')
      .select(`
        *,
        materias (nombre),
        grupos (nombre, niveles_academicos (nombre, niveles_educativos (nombre))),
        usuarios (nombre)
      `)
      .order('id');

    if (error) throw error;

    const result = data.map(gm => ({
      ...gm,
      materia_nombre: gm.materias?.nombre,
      grupo_nombre: gm.grupos?.nombre,
      maestro_nombre: gm.usuarios?.nombre,
      nivel_academico: gm.grupos?.niveles_academicos?.nombre,
      nivel_educativo: gm.grupos?.niveles_academicos?.niveles_educativos?.nombre,
      materias: undefined,
      grupos: undefined,
      usuarios: undefined
    }));

    res.json(result);
    } catch (error) {
      console.error('ERROR GRUPOS:', JSON.stringify(error, null, 2));
      res.status(500).json({ message: 'Error obteniendo grupos', detail: error });
    }
};

exports.obtenerMateriasPorGrupo = async (req, res) => {
  try {
    const { grupo_id } = req.params;

    const { data, error } = await supabase
      .from('grupo_materias')
      .select(`
        *,
        materias (nombre),
        usuarios (nombre)
      `)
      .eq('grupo_id', grupo_id)
      .order('id');

    if (error) throw error;

    const result = data.map(gm => ({
      ...gm,
      materia_nombre: gm.materias?.nombre,
      maestro_nombre: gm.usuarios?.nombre,
      materias: undefined,
      usuarios: undefined
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo materias del grupo' });
  }
};

exports.eliminarGrupoMateria = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('grupo_materias')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Materia eliminada del grupo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando materia del grupo' });
  }
};