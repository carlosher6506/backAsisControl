const supabase = require('../../config/supabase');

exports.calificar = async (req, res) => {
  try {
    const { alumno_id, tarea_id, calificacion, puntos_obtenidos } = req.body;

    const calificacionConvertida = calificacion !== null && calificacion !== undefined
      ? Math.round((calificacion / 10) * 100) / 100
      : null;

    // Supabase no tiene ON CONFLICT nativo en el SDK, usamos upsert
    const { data, error } = await supabase
      .from('calificaciones')
      .upsert(
        {
          alumno_id,
          tarea_id,
          calificacion: calificacionConvertida,
          puntos_obtenidos: puntos_obtenidos || null
        },
        { onConflict: 'alumno_id,tarea_id' }
      )
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error calificar:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.obtenerCalificaciones = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('calificaciones')
      .select(`
        *,
        alumnos (nombre),
        tareas (
          nombre, periodo, etiqueta_id,
          etiquetas (nombre, valor_total),
          grupo_materias (grupo_id, materia_id)
        )
      `)
      .order('id');

    if (error) throw error;

    const result = data.map(c => ({
      ...c,
      alumno_nombre: c.alumnos?.nombre,
      tarea_nombre: c.tareas?.nombre,
      periodo: c.tareas?.periodo,
      etiqueta_id: c.tareas?.etiqueta_id,
      etiqueta_nombre: c.tareas?.etiquetas?.nombre,
      valor_total: c.tareas?.etiquetas?.valor_total,
      grupo_id: c.tareas?.grupo_materias?.grupo_id,
      materia_id: c.tareas?.grupo_materias?.materia_id,
      alumnos: undefined,
      tareas: undefined
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo calificaciones' });
  }
};

exports.obtenerCalificacionesPorAlumno = async (req, res) => {
  try {
    const { alumno_id, grupo_materia_id } = req.params;

    // Esta query usa CTEs complejas, se delega a RPC
    const { data, error } = await supabase.rpc('obtener_calificaciones_alumno', {
      p_alumno_id: parseInt(alumno_id),
      p_grupo_materia_id: parseInt(grupo_materia_id)
    });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo calificaciones del alumno' });
  }
};

exports.eliminarCalificacion = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('calificaciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Calificación eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando calificación' });
  }
};

exports.actualizarCalificacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { calificacion } = req.body;

    const { data, error } = await supabase
      .from('calificaciones')
      .update({ calificacion })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando calificación' });
  }
};

exports.obtenerBoleta = async (req, res) => {
  try {
    const { alumno_id } = req.params;

    // Info del alumno
    const { data: alumnoData, error: alumnoError } = await supabase
      .from('alumnos')
      .select(`
        *,
        grupos (
          nombre,
          niveles_academicos (nombre, niveles_educativos (nombre)),
          ciclos_escolares (nombre, fecha_inicio, fecha_fin)
        )
      `)
      .eq('id', alumno_id)
      .single();

    if (alumnoError || !alumnoData) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }

    const alumno = {
      ...alumnoData,
      grupo_nombre: alumnoData.grupos?.nombre,
      nivel_academico: alumnoData.grupos?.niveles_academicos?.nombre,
      nivel_educativo: alumnoData.grupos?.niveles_academicos?.niveles_educativos?.nombre,
      ciclo_escolar: alumnoData.grupos?.ciclos_escolares?.nombre,
      fecha_inicio: alumnoData.grupos?.ciclos_escolares?.fecha_inicio,
      fecha_fin: alumnoData.grupos?.ciclos_escolares?.fecha_fin,
      grupos: undefined
    };

    // Calificaciones agrupadas via RPC (query muy compleja)
    const { data: calificaciones, error: calError } = await supabase.rpc('obtener_boleta_alumno', {
      p_alumno_id: parseInt(alumno_id)
    });

    if (calError) throw calError;

    res.json({ alumno, calificaciones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generando boleta' });
  }
};