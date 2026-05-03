const supabase = require('../../config/supabase');
const bcrypt = require('bcrypt');

exports.crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const { data: rolData, error: rolError } = await supabase
      .from('roles')
      .select('id')
      .eq('nombre', rol)
      .single();

    if (rolError || !rolData) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('usuarios')
      .insert({ nombre, email, password: passwordHash, rol_id: rolData.id })
      .select('id, nombre, email')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando usuario' });
  }
};

exports.obtenerUsuarios = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id, nombre, email,
        roles (nombre)
      `);

    if (error) throw error;

    const result = data.map(u => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.roles?.nombre
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo usuarios' });
  }
};

exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        id, nombre, email,
        roles (nombre)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      id: data.id,
      nombre: data.nombre,
      email: data.email,
      rol: data.roles?.nombre
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo usuario' });
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando usuario' });
  }
};

exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol } = req.body;

    const { data: rolData, error: rolError } = await supabase
      .from('roles')
      .select('id')
      .eq('nombre', rol)
      .single();

    if (rolError || !rolData) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const { data, error } = await supabase
      .from('usuarios')
      .update({ nombre, email, rol_id: rolData.id })
      .eq('id', id)
      .select('id, nombre, email')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando usuario' });
  }
};