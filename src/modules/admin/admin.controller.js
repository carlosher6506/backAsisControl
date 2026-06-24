const supabase = require('../../config/supabase');

const DIAS_ACTIVO      = 7;   // <= 7 días  → activo
const DIAS_POCO_ACTIVO = 30;  // <= 30 días → poco activo

exports.getUsuariosActividad = async (req, res) => {
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select(`
        id,
        nombre,
        email,
        activo,
        email_verificado,
        ultimo_login,
        total_logins,
        created_at,
        roles!usuarios_rol_id_fkey (nombre)
      `)
      .order('ultimo_login', { ascending: false, nullsFirst: false });

    if (error) throw error;

    const ahora = new Date();

    const result = usuarios.map(u => {
      const ultimoLogin   = u.ultimo_login ? new Date(u.ultimo_login) : null;
      const diasInactivo  = ultimoLogin
        ? Math.floor((ahora - ultimoLogin) / (1000 * 60 * 60 * 24))
        : null;

      let estado;
      if (!ultimoLogin)                        estado = 'nunca';
      else if (diasInactivo <= DIAS_ACTIVO)    estado = 'activo';
      else if (diasInactivo <= DIAS_POCO_ACTIVO) estado = 'poco_activo';
      else                                     estado = 'inactivo';

      return {
        id:             u.id,
        nombre:         u.nombre,
        email:          u.email,
        rol:            u.roles?.nombre || 'sin rol',
        activo:         u.activo,
        emailVerificado: u.email_verificado,
        ultimoLogin:    u.ultimo_login,
        totalLogins:    u.total_logins || 0,
        diasInactivo,
        estado,
        creadoEn:       u.created_at
      };
    });

    const resumen = {
      activos:     result.filter(u => u.estado === 'activo').length,
      pocoActivos: result.filter(u => u.estado === 'poco_activo').length,
      inactivos:   result.filter(u => u.estado === 'inactivo').length,
      nunca:       result.filter(u => u.estado === 'nunca').length,
    };

    res.json({ usuarios: result, resumen });

  } catch (error) {
    console.error('Error getUsuariosActividad:', error);
    res.status(500).json({ message: 'Error obteniendo actividad de usuarios' });
  }
};

exports.getActividadSemanal = async (req, res) => {
  try {
    const dias   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const conteo = {};

    // Construir los últimos 7 días como keys YYYY-MM-DD
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      conteo[d.toISOString().split('T')[0]] = 0;
    }

    const desde = Object.keys(conteo)[0] + 'T00:00:00.000Z';

    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('ultimo_login')
      .gte('ultimo_login', desde)
      .not('ultimo_login', 'is', null);

    if (error) throw error;

    usuarios.forEach(u => {
      const key = u.ultimo_login.split('T')[0];
      if (conteo[key] !== undefined) conteo[key]++;
    });

    const labels = Object.keys(conteo).map(k => {
      const d = new Date(k + 'T12:00:00');
      return dias[d.getDay()];
    });

    res.json({ labels, data: Object.values(conteo) });

  } catch (error) {
    console.error('Error getActividadSemanal:', error);
    res.status(500).json({ message: 'Error obteniendo actividad semanal' });
  }
};