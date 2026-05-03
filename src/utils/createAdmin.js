const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

const crearAdmin = async () => {
  try {
    // Verificar si ya existe el email directamente
    const { data: existe } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', 'gohedevelop@gmail.com')
      .maybeSingle();

    if (existe) {
      console.log('Admin already exists.');
      return;
    }

    console.log('Admin not found. Creating initial admin...');

    const { data: rolData, error: rolError } = await supabase
      .from('roles')
      .select('id')
      .eq('nombre', 'admin')
      .single();

    if (rolError || !rolData) {
      console.error('No admin role found.');
      return;
    }

    const passwordHash = await bcrypt.hash('admin123', 10);

    const { error } = await supabase
      .from('usuarios')
      .insert({
        nombre: 'Administrador',
        email: 'gohedevelop@gmail.com',
        password: passwordHash,
        rol_id: rolData.id,
        activo: true
      });

    if (error) throw error;

    console.log('Admin created successfully!');

  } catch (error) {
    console.error('Error to create admin:', error.message);
  }
};

module.exports = crearAdmin;