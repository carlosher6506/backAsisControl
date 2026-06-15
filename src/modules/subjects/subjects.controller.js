const supabase = require('../../config/supabase');

exports.crearMateria = async (req, res) => {
  try {
    const { nombre } = req.body;
    const { id: maestro_id } = req.user;

    // Verifica duplicado solo dentro del catálogo del mismo maestro
    const { data: existe } = await supabase
      .from('materias')
      .select('id')
      .ilike('nombre', nombre)
      .eq('maestro_id', maestro_id);

    if (existe && existe.length > 0) {
      return res.status(400).json({ message: 'Ya existe una materia con ese nombre' });
    }

    const { data, error } = await supabase
      .from('materias')
      .insert({ nombre, maestro_id })
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creando materia' });
  }
};

exports.obtenerMaterias = async (req, res) => {
  try {
    const { id: maestro_id, rol } = req.user;

    let query = supabase
      .from('materias')
      .select('*')
      .order('nombre');

    if (rol !== 'admin') {
      query = query.eq('maestro_id', maestro_id);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error obteniendo materias' });
  }
};

exports.actualizarMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    const { id: maestro_id } = req.user;

    // Solo puede editar sus propias materias
    const { data, error } = await supabase
      .from('materias')
      .update({ nombre })
      .eq('id', id)
      .eq('maestro_id', maestro_id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Materia no encontrada o no autorizado' });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando materia' });
  }
};

exports.eliminarMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: maestro_id } = req.user;

    // Solo puede eliminar sus propias materias
    const { error } = await supabase
      .from('materias')
      .delete()
      .eq('id', id)
      .eq('maestro_id', maestro_id);

    if (error) throw error;
    res.json({ message: 'Materia eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando materia' });
  }
};