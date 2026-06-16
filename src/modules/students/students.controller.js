const supabase = require('../../config/supabase');

// ─── Genera una matrícula única de solo números ───────────────────────────────
// Formato: YYYYMMDDXXXXXX  (fecha + 6 dígitos aleatorios)
// Se reintenta hasta 5 veces si hay colisión
async function generarMatriculaUnica() {
  const ahora = new Date();
  const prefijo =
    String(ahora.getFullYear()) +
    String(ahora.getMonth() + 1).padStart(2, '0') +
    String(ahora.getDate()).padStart(2, '0');

  for (let intento = 0; intento < 5; intento++) {
    const sufijo = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
    const matricula = prefijo + sufijo;

    const { data } = await supabase
      .from('alumnos')
      .select('id')
      .eq('matricula', matricula)
      .maybeSingle();

    if (!data) return matricula; // no existe → es única
  }

  // Fallback: timestamp en ms + 3 dígitos aleatorios
  return String(Date.now()) + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
}

// ─── Crear alumno ─────────────────────────────────────────────────────────────
exports.crearAlumno = async (req, res) => {
  try {
    const { grupo_id, nombre } = req.body;

    if (!nombre || !grupo_id) {
      return res.status(400).json({ message: 'El nombre y el grupo son requeridos' });
    }

    const matricula = await generarMatriculaUnica();

    const { data, error } = await supabase
      .from('alumnos')
      .insert({ grupo_id, nombre, matricula })
      .select()
      .single();

    if (error) throw error;

    // Registrar en alumno_grupos
    await supabase
      .from('alumno_grupos')
      .insert({ alumno_id: data.id, grupo_id });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando alumno' });
  }
};

// ─── Obtener todos los alumnos ────────────────────────────────────────────────
exports.obtenerAlumnos = async (req, res) => {
  try {
    const { id: usuario_id, rol } = req.user;

    const { data, error } = await supabase.rpc('obtener_alumnos', {
      p_usuario_id: usuario_id,
      p_rol: rol
    });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo alumnos' });
  }
};

// ─── Obtener alumno por ID ────────────────────────────────────────────────────
exports.obtenerAlumnoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('alumnos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Alumno no encontrado' });
    }

    const { data: grupos } = await supabase
      .from('alumno_grupos')
      .select('grupo_id')
      .eq('alumno_id', id);

    res.json({
      ...data,
      grupo_ids: (grupos || []).map(g => g.grupo_id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo alumno' });
  }
};

// ─── Actualizar alumno ────────────────────────────────────────────────────────
// La matrícula NO se puede modificar desde aquí
exports.actualizarAlumno = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, grupo_id, grupo_ids } = req.body;

    const camposActualizar = { nombre };
    if (grupo_id !== undefined) camposActualizar.grupo_id = grupo_id;

    const { data, error } = await supabase
      .from('alumnos')
      .update(camposActualizar)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (Array.isArray(grupo_ids) && grupo_ids.length > 0) {
      const { data: grupos } = await supabase
        .from('grupos')
        .select('id, nivel_academico_id')
        .in('id', grupo_ids);

      const niveles = [...new Set((grupos || []).map(g => g.nivel_academico_id))];
      if (niveles.length > 1) {
        return res.status(400).json({
          message: 'Todos los grupos deben ser del mismo nivel académico'
        });
      }

      await supabase.from('alumno_grupos').delete().eq('alumno_id', id);

      const inserts = grupo_ids.map(gid => ({ alumno_id: Number(id), grupo_id: gid }));
      const { error: insertError } = await supabase.from('alumno_grupos').insert(inserts);
      if (insertError) throw insertError;

      if (grupo_ids[0] !== undefined) {
        await supabase.from('alumnos').update({ grupo_id: grupo_ids[0] }).eq('id', id);
      }
    }

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando alumno' });
  }
};

// ─── Eliminar alumno ──────────────────────────────────────────────────────────
exports.eliminarAlumno = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('alumnos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Alumno eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando alumno' });
  }
};

// ─── Alumnos por grupo ────────────────────────────────────────────────────────
exports.obtenerAlumnosPorGrupo = async (req, res) => {
  try {
    const { grupo_id } = req.params;

    const { data, error } = await supabase
      .from('alumno_grupos')
      .select('alumnos (id, nombre, matricula, grupo_id)')
      .eq('grupo_id', grupo_id)
      .order('alumno_id');

    if (error) throw error;

    const alumnos = (data || []).map(r => r.alumnos).filter(Boolean);
    res.json(alumnos);
  } catch (error) {
    console.error(error);
    const { grupo_id } = req.params;
    const { data } = await supabase
      .from('alumnos')
      .select('id, nombre, matricula, grupo_id')
      .eq('grupo_id', grupo_id)
      .order('nombre');
    res.json(data || []);
  }
};

// ─── Grupos de un alumno ──────────────────────────────────────────────────────
exports.obtenerGruposDeAlumno = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('alumno_grupos')
      .select(`
        grupo_id,
        grupos (
          id, nombre, nivel_academico_id,
          niveles_academicos (nombre, nivel_educativo_id, niveles_educativos (nombre)),
          ciclos_escolares (nombre)
        )
      `)
      .eq('alumno_id', id);

    if (error) throw error;

    const grupos = (data || []).map(r => ({
      ...r.grupos,
      nivel_academico: r.grupos?.niveles_academicos?.nombre,
      nivel_educativo: r.grupos?.niveles_academicos?.niveles_educativos?.nombre,
      ciclo_escolar:   r.grupos?.ciclos_escolares?.nombre,
    }));

    res.json(grupos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo grupos del alumno' });
  }
};

// ─── Consulta pública por matrícula ──────────────────────────────────────────
exports.consultarPorMatricula = async (req, res) => {
  try {
    const { matricula } = req.params;

    const { data: alumnoData, error: alumnoError } = await supabase
      .from('alumnos')
      .select(`
        id, nombre, matricula,
        grupos (
          nombre,
          niveles_academicos (nombre, niveles_educativos (nombre)),
          ciclos_escolares (nombre)
        )
      `)
      .eq('matricula', matricula)
      .single();

    if (alumnoError || !alumnoData) {
      return res.status(404).json({ message: 'Matrícula no encontrada' });
    }

    const alumno = {
      id:              alumnoData.id,
      nombre:          alumnoData.nombre,
      matricula:       alumnoData.matricula,
      grupo_nombre:    alumnoData.grupos?.nombre,
      nivel_academico: alumnoData.grupos?.niveles_academicos?.nombre,
      nivel_educativo: alumnoData.grupos?.niveles_academicos?.niveles_educativos?.nombre,
      ciclo_escolar:   alumnoData.grupos?.ciclos_escolares?.nombre
    };

    const { data: calificaciones, error: calError } = await supabase.rpc(
      'obtener_calificaciones_por_matricula',
      { p_alumno_id: alumno.id }
    );

    if (calError) throw calError;

    res.json({ alumno, calificaciones });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error consultando calificaciones' });
  }
};