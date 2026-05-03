const supabase = require('../../config/supabase');

const verificarPuntosDisponibles = async (etiqueta_id, grupo_materia_id, valor_propio, periodo, tarea_id_excluir = null) => {
  if (!etiqueta_id || !valor_propio) return { valido: true };

  const { data: etiqueta } = await supabase
    .from('etiquetas')
    .select('valor_total')
    .eq('id', etiqueta_id)
    .single();

  if (!etiqueta) return { valido: true };

  const valorTotal = Number(etiqueta.valor_total);

  let query = supabase
    .from('tareas')
    .select('valor_propio')
    .eq('etiqueta_id', etiqueta_id)
    .eq('grupo_materia_id', grupo_materia_id)
    .eq('periodo', periodo)
    .not('valor_propio', 'is', null);

  if (tarea_id_excluir) {
    query = query.neq('id', tarea_id_excluir);
  }

  const { data: tareasExistentes } = await query;

  const totalAsignado = (tareasExistentes || []).reduce(
    (sum, t) => sum + Number(t.valor_propio), 0
  );

  const disponible = valorTotal - totalAsignado;

  if (valor_propio > disponible) {
    return {
      valido: false,
      mensaje: `Solo hay ${disponible} pts disponibles en este periodo para esta etiqueta (total: ${valorTotal}, asignados: ${totalAsignado})`
    };
  }

  return { valido: true };
};

exports.crearTarea = async (req, res) => {
  try {
    const { grupo_materia_id, nombre, fecha, periodo, etiqueta_id, valor_propio } = req.body;

    const validacion = await verificarPuntosDisponibles(
      etiqueta_id, grupo_materia_id, valor_propio, periodo
    );
    if (!validacion.valido) {
      return res.status(400).json({ message: validacion.mensaje });
    }

    const { data, error } = await supabase
      .from('tareas')
      .insert({
        grupo_materia_id,
        nombre,
        fecha,
        periodo,
        etiqueta_id: etiqueta_id || null,
        valor_propio: valor_propio || null
      })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando tarea' });
  }
};

exports.actualizarTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, fecha, periodo, etiqueta_id, valor_propio } = req.body;

    const { data: tareaActual } = await supabase
      .from('tareas')
      .select('grupo_materia_id')
      .eq('id', id)
      .single();

    const validacion = await verificarPuntosDisponibles(
      etiqueta_id,
      tareaActual?.grupo_materia_id,
      valor_propio,
      periodo,
      id
    );
    if (!validacion.valido) {
      return res.status(400).json({ message: validacion.mensaje });
    }

    const { data, error } = await supabase
      .from('tareas')
      .update({
        nombre,
        fecha,
        periodo,
        etiqueta_id: etiqueta_id || null,
        valor_propio: valor_propio || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando tarea' });
  }
};

exports.obtenerTareas = async (req, res) => {
  try {
    const { id: usuario_id, rol } = req.user;

    let query = supabase
      .from('tareas')
      .select(`
        *,
        etiquetas (nombre, valor_total),
        grupo_materias (
          maestro_id,
          materias (nombre),
          grupos (nombre, niveles_academicos (nombre, niveles_educativos (nombre)))
        )
      `)
      .order('id');

    const { data, error } = await query;
    if (error) throw error;

    // Filtrar por maestro si no es admin
    const filtrado = rol === 'admin'
      ? data
      : data.filter(t => t.grupo_materias?.maestro_id === usuario_id);

    const result = filtrado.map(t => ({
      ...t,
      etiqueta_nombre: t.etiquetas?.nombre,
      valor_total: t.etiquetas?.valor_total,
      materia_nombre: t.grupo_materias?.materias?.nombre,
      grupo_nombre: t.grupo_materias?.grupos?.nombre,
      nivel_academico: t.grupo_materias?.grupos?.niveles_academicos?.nombre,
      nivel_educativo: t.grupo_materias?.grupos?.niveles_academicos?.niveles_educativos?.nombre,
      etiquetas: undefined,
      grupo_materias: undefined
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo tareas' });
  }
};

exports.obtenerTareasPorGrupoMateria = async (req, res) => {
  try {
    const { grupo_materia_id } = req.params;

    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .eq('grupo_materia_id', grupo_materia_id)
      .order('periodo')
      .order('fecha');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo tareas del grupo materia' });
  }
};

exports.eliminarTarea = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tareas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando tarea' });
  }
};