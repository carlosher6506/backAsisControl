const supabase = require('../../config/supabase');

exports.obtenerPerfil = async (req, res) => {
  try {
    const { id } = req.user;

    const { data, error } = await supabase
      .from('perfiles_maestro')
      .select(`
        *,
        usuarios (nombre, email)
      `)
      .eq('usuario_id', id)
      .maybeSingle();

    if (!data) {
      return res.json({ usuario_id: id, existe: false });
    }

    res.json({
      ...data,
      nombre_usuario: data.usuarios?.nombre,
      email: data.usuarios?.email,
      usuarios: undefined,
      existe: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo perfil' });
  }
};

exports.guardarPerfil = async (req, res) => {
  try {
    const { id } = req.user;
    const {
      nombre, apellido, telefono, curp, rfc,
      especialidad, carrera, direccion, codigo_classroom
    } = req.body;

    // Verifica si ya existe
    const { data: existe } = await supabase
      .from('perfiles_maestro')
      .select('id')
      .eq('usuario_id', id)
      .maybeSingle();

    let data, error;

    if (existe) {
      ({ data, error } = await supabase
        .from('perfiles_maestro')
        .update({
          nombre, apellido, telefono, curp, rfc,
          especialidad, carrera, direccion, codigo_classroom,
          updated_at: new Date().toISOString()
        })
        .eq('usuario_id', id)
        .select()
        .single());
    } else {
      ({ data, error } = await supabase
        .from('perfiles_maestro')
        .insert({
          usuario_id: id,
          nombre, apellido, telefono, curp, rfc,
          especialidad, carrera, direccion, codigo_classroom
        })
        .select()
        .single());
    }

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error guardando perfil' });
  }
};