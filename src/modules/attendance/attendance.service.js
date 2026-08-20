const crypto = require('crypto');
const supabase = require('../../config/supabase');

const ESTADOS_VALIDOS = ['presente','ausente','retardo','justificado'];
const METODOS_VALIDOS = ['manual', 'qr'];
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;


class AttendanceError extends Error {
    constructor(status, message){
        super(message);
        this.status = status;
    }
}

async function obtenerGrupoMateriaOFallar(grupoMateriaId) {
    const { data, error } = await supabase
    .from('grupo_materias')
    .select('id, grupo_id, materia_id, maestro_id')
    .eq('id', grupoMateriaId)
    .single();

    if (error || !data){
        throw new AttendanceError(404, 'Materia de grupo no encontrada');
    }
    return data;
}

async function obtenerSesionOFallar(sesionId) {
  const { data, error } = await supabase
    .from('asistencia_sesiones')
    .select('id, grupo_materia_id, maestro_id, fecha, metodo_default, cerrada')
    .eq('id', sesionId)
    .single();
 
  if (error || !data) {
    throw new AttendanceError(404, 'Sesión de asistencia no encontrada');
  }
  return data;
}

async function verificarPropiedad(maestroIdRecurso, usuarioAutenticado){
    const { id: usuarioId, rol } = usuarioAutenticado;

    if (rol !== 'admin' && maestroIdRecurso !== usuarioId) {
        throw new AttendanceError(403, 'No tienes acceso a este recurso');
    }
}

async function verificarAccesoQrAlumno(alumnoId, usuarioAutenticado) {
  const { id: usuarioId, rol } = usuarioAutenticado;

  if (rol === 'admin') {
    return;
  }

  if (rol !== 'maestro') {
    throw new AttendanceError(403, 'No tienes permiso para emitir credenciales QR');
  }

  const { data: gruposAlumno, error: errorGrupos } = await supabase
    .from('alumno_grupos')
    .select('grupo_id')
    .eq('alumno_id', alumnoId);

  if (errorGrupos) {
    throw errorGrupos;
  }

  const gruposIds = gruposAlumno?.map(({ grupo_id }) => grupo_id) || [];
  if (!gruposIds.length) {
    throw new AttendanceError(403, 'No tienes acceso a este alumno');
  }

  const { data: asignacion, error: errorAsignacion } = await supabase
    .from('grupo_materias')
    .select('id')
    .eq('maestro_id', usuarioId)
    .in('grupo_id', gruposIds)
    .limit(1)
    .maybeSingle();

  if (errorAsignacion) {
    throw errorAsignacion;
  }

  if (!asignacion) {
    throw new AttendanceError(403, 'No tienes acceso a este alumno');
  }
}

function validarEstado(estado){
    if (!ESTADOS_VALIDOS.includes(estado)) {
        throw new AttendanceError(400, `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
    }
}

function validarMetodo(metodo){
    if (metodo && !METODOS_VALIDOS.includes(metodo)) {
        throw new AttendanceError(400, `Método inválido. Valores permitidos: ${METODOS_VALIDOS.join(', ')}`);
    }
}

function validarFecha(fecha, nombreCampo = 'fecha'){
    if (fecha && !FECHA_REGEX.test(fecha)) {
        throw new AttendanceError(400, `${nombreCampo} debe tener formato YYYY-MM-DD`);
    }
}

function validarEntero(valor, nombreCampo){
    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new AttendanceError(400, `${nombreCampo} debe ser un entero válido`);
    }
    return numero;
}

function generarTokenQr(){
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
  AttendanceError,
  ESTADOS_VALIDOS,
  METODOS_VALIDOS,
  obtenerGrupoMateriaOFallar,
  obtenerSesionOFallar,
  verificarPropiedad,
  verificarAccesoQrAlumno,
  validarEstado,
  validarMetodo,
  validarFecha,
  validarEntero,
  generarTokenQr,
};
