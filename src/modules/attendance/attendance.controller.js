const supabase = require('../../config/supabase');
const { AttendanceError, obtenerGrupoMateriaOFallar, obtenerSesionOFallar, verificarPropiedad, validarEstado, 
    validarMetodo, validarFecha, validarEntero, generarTokenQr
} = require('./attendance.service');

function manejarError(res, error, mensajeGenerico) {
  if (error instanceof AttendanceError) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(mensajeGenerico, error);
  return res.status(500).json({ message: mensajeGenerico });
}

exports.obtenerMateriasDelGrupo = async (req, res) => {
  try {
    const { id: usuarioId, rol } = req.user;
    const grupoId = validarEntero(req.query.grupo_id, 'grupo_id');

    let maestroId = usuarioId;
    if (rol === 'admin' && req.query.maestro_id) {
      maestroId = validarEntero(req.query.maestro_id, 'maestro_id');
    }

    const { data, error } = await supabase.rpc('obtener_materias_grupo_maestro', {
      p_grupo_id: grupoId,
      p_maestro_id: maestroId,
    });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    manejarError(res, error, 'Error obteniendo materias del grupo');
  }
};

exports.crearOEntrarSesion = async (req, res) => {
  try {
    const { grupo_materia_id, fecha, metodo_default } = req.body;
    const grupoMateriaId = validarEntero(grupo_materia_id, 'grupo_materia_id');
    validarFecha(fecha);
    validarMetodo(metodo_default);

    const grupoMateria = await obtenerGrupoMateriaOFallar(grupoMateriaId);
    verificarPropiedad(grupoMateria.maestro_id, req.user);

    const { data: sesionId, error } = await supabase.rpc('obtener_o_crear_sesion_dia', {
      p_grupo_materia_id: grupoMateriaId,
      p_maestro_id: grupoMateria.maestro_id,
      p_fecha: fecha || new Date().toISOString().slice(0, 10),
      p_metodo_default: metodo_default || 'manual',
    });

    if (error) throw error;
    res.json({ sesion_id: sesionId });
  } catch (error) {
    manejarError(res, error, 'Error abriendo la sesión de asistencia');
  }
};

exports.obtenerListaSesion = async (req, res) => {
  try {
    const sesionId = validarEntero(req.params.id, 'id');
    const sesion = await obtenerSesionOFallar(sesionId);
    verificarPropiedad(sesion.maestro_id, req.user);

    const { data, error } = await supabase.rpc('obtener_lista_pase_asistencia', {
      p_sesion_id: sesionId,
    });

    if (error) throw error;
    res.json({ sesion, alumnos: data });
  } catch (error) {
    manejarError(res, error, 'Error obteniendo la lista de asistencia');
  }
};

exports.registrarManual = async (req, res) => {
  try {
    const { sesion_id, alumno_id, estado, justificacion } = req.body;
    const sesionId = validarEntero(sesion_id, 'sesion_id');
    const alumnoId = validarEntero(alumno_id, 'alumno_id');
    validarEstado(estado);

    const sesion = await obtenerSesionOFallar(sesionId);
    verificarPropiedad(sesion.maestro_id, req.user);

    if (sesion.cerrada) {
      throw new AttendanceError(409, 'Esta sesión ya fue cerrada');
    }

    const { data: registroId, error } = await supabase.rpc('registrar_asistencia_manual', {
      p_sesion_id: sesionId,
      p_alumno_id: alumnoId,
      p_estado: estado,
      p_registrado_por: req.user.id,
      p_justificacion: justificacion || null,
    });

    if (error) throw error;
    res.json({ registro_id: registroId, estado });
  } catch (error) {
    manejarError(res, error, 'Error registrando asistencia');
  }
};

exports.registrarQr = async (req, res) => {
  try {
    const { sesion_id, token } = req.body;
    const sesionId = validarEntero(sesion_id, 'sesion_id');

    if (!token || typeof token !== 'string' || token.length > 64) {
      throw new AttendanceError(400, 'Token de QR inválido');
    }

    const sesion = await obtenerSesionOFallar(sesionId);
    verificarPropiedad(sesion.maestro_id, req.user);

    if (sesion.cerrada) {
      throw new AttendanceError(409, 'Esta sesión ya fue cerrada');
    }

    const { data, error } = await supabase.rpc('registrar_asistencia_qr', {
      p_sesion_id: sesionId,
      p_token: token,
      p_registrado_por: req.user.id,
    });

    if (error) {
      if (error.message?.includes('QR_INVALIDO')) {
        throw new AttendanceError(404, 'Código QR no reconocido');
      }
      if (error.message?.includes('ALUMNO_NO_PERTENECE_AL_GRUPO')) {
        throw new AttendanceError(409, 'Este alumno no pertenece al grupo de esta sesión');
      }
      throw error;
    }

    const resultado = data?.[0];
    res.json({
      alumno_id: resultado.alumno_id,
      alumno_nombre: resultado.alumno_nombre,
      estado: resultado.estado,
      ya_estaba_registrado: resultado.ya_estaba_registrado,
    });
  } catch (error) {
    manejarError(res, error, 'Error registrando asistencia por QR');
  }
};

exports.cerrarSesion = async (req, res) => {
  try {
    const sesionId = validarEntero(req.params.id, 'id');

    const sesion = await obtenerSesionOFallar(sesionId);
    verificarPropiedad(sesion.maestro_id, req.user);

    const { data, error } = await supabase
      .from('asistencia_sesiones')
      .update({ cerrada: true })
      .eq('id', sesionId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    manejarError(res, error, 'Error cerrando la sesión');
  }
};

exports.obtenerReporte = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const grupoMateriaId = validarEntero(req.query.grupo_materia_id, 'grupo_materia_id');
    validarFecha(fecha_inicio, 'fecha_inicio');
    validarFecha(fecha_fin, 'fecha_fin');

    if (!fecha_inicio || !fecha_fin) {
      throw new AttendanceError(400, 'fecha_inicio y fecha_fin son obligatorias');
    }

    const grupoMateria = await obtenerGrupoMateriaOFallar(grupoMateriaId);
    verificarPropiedad(grupoMateria.maestro_id, req.user);

    const { data, error } = await supabase.rpc('obtener_reporte_asistencia_grupo_materia', {
      p_grupo_materia_id: grupoMateriaId,
      p_fecha_inicio: fecha_inicio,
      p_fecha_fin: fecha_fin,
    });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    manejarError(res, error, 'Error generando el reporte de asistencia');
  }
};

exports.obtenerQrAlumno = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      throw new AttendanceError(403, 'Solo un administrador puede emitir credenciales QR');
    }

    const alumnoId = validarEntero(req.params.alumno_id, 'alumno_id');

    const { data: existente, error: errorBusqueda } = await supabase
      .from('alumno_qr_tokens')
      .select('token, activo, created_at')
      .eq('alumno_id', alumnoId)
      .maybeSingle();

    if (errorBusqueda) throw errorBusqueda;

    if (existente) {
      return res.json(existente);
    }

    const token = generarTokenQr();
    const { data: nuevo, error: errorInsert } = await supabase
      .from('alumno_qr_tokens')
      .insert({ alumno_id: alumnoId, token })
      .select('token, activo, created_at')
      .single();

    if (errorInsert) throw errorInsert;
    res.json(nuevo);
  } catch (error) {
    manejarError(res, error, 'Error obteniendo credencial QR');
  }
};

exports.regenerarQrAlumno = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      throw new AttendanceError(403, 'Solo un administrador puede regenerar credenciales QR');
    }

    const alumnoId = validarEntero(req.params.alumno_id, 'alumno_id');
    const token = generarTokenQr();

    const { data, error } = await supabase
      .from('alumno_qr_tokens')
      .upsert(
        { alumno_id: alumnoId, token, activo: true, regenerated_at: new Date().toISOString() },
        { onConflict: 'alumno_id' }
      )
      .select('token, activo, regenerated_at')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    manejarError(res, error, 'Error regenerando credencial QR');
  }
};