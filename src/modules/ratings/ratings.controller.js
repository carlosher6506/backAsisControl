exports.obtenerCalificacionesPorAlumno = async (req, res) => {
  try {
    const { alumno_id, grupo_materia_id } = req.params;

    const { data, error } = await supabase.rpc(
      'obtener_calificaciones_alumno',
      {
        p_alumno_id: parseInt(alumno_id),
        p_grupo_materia_id: parseInt(grupo_materia_id)
      }
    );

    if (error) throw error;

    const {
      data: tareas,
      error: tareasError
    } = await supabase
      .from('tareas')
      .select(`
        id,
        nombre,
        fecha,
        periodo,
        etiqueta_id,
        valor_propio,
        etiquetas (nombre, valor_total)
      `)
      .eq('grupo_materia_id', parseInt(grupo_materia_id))
      .order('periodo')
      .order('fecha');

    if (tareasError) throw tareasError;

    const tareasPorId = new Map(
      (tareas || []).map((tarea) => [tarea.id, tarea])
    );

    const calificaciones = (data || []).map((calificacion) => {
      const tarea = tareasPorId.get(Number(calificacion.tarea_id));

      const tieneValorPropio =
        tarea?.valor_propio !== null &&
        tarea?.valor_propio !== undefined;

      return {
        ...calificacion,
        tarea_nombre: tarea?.nombre ?? calificacion.tarea_nombre,
        fecha: tarea?.fecha ?? calificacion.fecha,
        periodo: tarea?.periodo ?? calificacion.periodo,
        etiqueta_id: tarea?.etiqueta_id ?? calificacion.etiqueta_id,
        etiqueta_nombre:
          tarea?.etiquetas?.nombre ??
          calificacion.etiqueta_nombre,
        valor_total:
          tarea?.etiquetas?.valor_total ??
          calificacion.valor_total,
        valor_propio: tieneValorPropio
          ? Number(tarea.valor_propio)
          : null,
        valor_tarea: tieneValorPropio
          ? Number(tarea.valor_propio)
          : calificacion.valor_tarea
      };
    });

    const tareasFaltantes = (tareas || [])
      .filter(
        (tarea) =>
          !calificaciones.some(
            (calificacion) =>
              Number(calificacion.tarea_id) === Number(tarea.id)
          )
      )
      .map((tarea) => ({
        alumno_id: parseInt(alumno_id),
        tarea_id: tarea.id,
        calificacion: null,
        puntos_obtenidos: null,
        tarea_nombre: tarea.nombre,
        fecha: tarea.fecha,
        periodo: tarea.periodo,
        etiqueta_id: tarea.etiqueta_id,
        etiqueta_nombre: tarea.etiquetas?.nombre,
        valor_total: tarea.etiquetas?.valor_total,
        valor_propio:
          tarea.valor_propio === null ||
          tarea.valor_propio === undefined
            ? null
            : Number(tarea.valor_propio),
        valor_tarea:
          tarea.valor_propio === null ||
          tarea.valor_propio === undefined
            ? null
            : Number(tarea.valor_propio)
      }));

    res.json([
      ...calificaciones,
      ...tareasFaltantes
    ]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Error obteniendo calificaciones del alumno'
    });
  }
};
