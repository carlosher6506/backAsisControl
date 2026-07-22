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
    const { id: maestro_id, rol } = req.user;

    if(!nombre || !nombre.trim()){
      return res.status(400).json({message: 'El nombre es requerido'});
    }
    const nombreLimpio = nombre.trim();

    // Verificamos que la materia si exista y a quien le pertenezca y se pueda eidtar
    let queryExistente = supabase.from('materias').select('id, maestro_id').eq('id', id);
    if(rol !== 'admin'){
      queryExistente = queryExistente.eq('maestro_id', maestro_id);
    }
    const {data: materiaExistente, error: errorExistente} = await queryExistente.maybeSingle();
    if(errorExistente) throw errorExistente;
    if(!materiaExistente){
      return res.status(404).json({message: 'Materia no encontrada o no autorizado'})
    }

    // Evitar Nombre duplicados dentro del mismo catalogo
    const { data: duplicada, error: errorDup } = await supabase
      .from('materias')
      .select('id')
      .ilike('nombre', nombreLimpio)
      .eq('maestro_id', materiaExistente.maestro_id)
      .neq('id', id);

    if (errorDup) throw errorDup;
    if (duplicada && duplicada.length > 0) {
      return res.status(400).json({ message: 'Ya existe una materia con ese nombre' });
    }
    
    // Actualizar materia implementando maybeSingle
    const {data, error} = await supabase
      .from('materias')
      .update({nombre : nombreLimpio})
      .eq('id', id)
      .select()
      .maybeSingle()
    if(error) throw error;
    if(!data){
      return res.status(404).json({message: 'La materia no fue encontrada'});
    }
    res.json(data);
  }catch(error){
    console.error(error);
    res.status(500).json({message: 'Error actualizando materia'});
  }
}

exports.eliminarMateria = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: maestro_id, rol} = req.user;

    let queryExistente = supabase.from('materias').select('id').eq('id', id);
    if(rol !== 'admin') {
      queryExistente = queryExistente.eq('maestro_id', maestro_id);
    }
    const {data: materiaExistente, error: errorExistente} = await queryExistente.maybeSingle();
    if (errorExistente) throw errorExistente
    if (!materiaExistente) {
      return res.status(404).json({message: 'Materia no encontrada o no autorizada'});
    } 

    // Solo puede eliminar sus propias materias
    const { error } = await supabase.from('materias').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Materia eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error eliminando materia' });
  }
};