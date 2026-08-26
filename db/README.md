# Base de datos comercial

`migrations/001_multitenancy_commercial_schema.sql` se ejecuta en la **nueva** base de Supabase, después de restaurar el respaldo actual. No debe ejecutarse en producción.

La migración agrega el modelo de teams, membresías por rol y nivel, invitaciones, suscripciones, pagos por transferencia y el `team_id` para aislar los datos académicos.

No vuelve obligatorios los `team_id` todavía: el backend actual no los envía. Primero se debe adaptar el backend y después ejecutar el endurecimiento de integridad y las políticas RLS.
