const supabase = require('../../config/supabase');

exports.crearMateria = async (req, res) => {
  try {
    const { nombre } = req.body;

    const { data: existe } = await supabase
      .from('materias')
      .select('id')
      .ilike('nombre', nombre);

    if (existe && existe.length > 0) {
      return res.status(400).json({ message: 'Ya existe una materia con ese nombre' });
    }

    const { data, error } = await supabase
      .from('materias')
      .insert({ nombre })
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
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .order('nombre');

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

    const { data, error } = await supabase
      .from('materias')
      .update({ nombre })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error actualizando materia' });
  }
};

exports.eliminarMateria = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('materias')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Materia eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando materia' });
  }
};