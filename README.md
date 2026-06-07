# CepillaCheck v3.0 — Historial & Cuidado Bucal

Versión mejorada del proyecto CepillaCheck enfocada únicamente en seguimiento de higiene bucal.

## Qué se agregó

- Dashboard con score diario de 0 a 100.
- Registro ampliado por cepillado:
  - hora exacta,
  - duración,
  - seda dental,
  - enjuague,
  - irrigador,
  - crema con flúor,
  - limpieza de lengua,
  - sangrado,
  - sensibilidad,
  - mal aliento,
  - nota opcional.
- Historial mensual completo por usuario.
- Exportación CSV del historial mensual y del historial completo.
- Estadísticas mejoradas:
  - score promedio,
  - días completos,
  - días perfectos,
  - cumplimiento mañana/noche,
  - uso de seda, enjuague, irrigador y lengua,
  - duración promedio,
  - días con señales,
  - cumplimiento por día de la semana,
  - calendario con detección de síntomas.
- Nueva sección Cuidado bucal:
  - señales/síntomas,
  - kit bucal e insumos,
  - visitas odontológicas.
- Compatibilidad con registros anteriores de `sessions`.

## Firebase

Se mantiene el proyecto Firebase original y las mismas credenciales del ZIP recibido.

La app sigue usando:

- `users/{userId}/sessions/{YYYY-MM-DD}` para el resumen diario.
- `users/{userId}/events` para eventos de cepillado detallados.
- `users/{userId}/symptoms` para señales bucales.
- `users/{userId}/careItems` para insumos del kit bucal.
- `users/{userId}/dentalVisits` para visitas odontológicas.

## Nota de seguridad

Se conservaron las credenciales hardcodeadas del proyecto original para mantenerlo funcionando igual. Para producción real, lo decente sería migrar a autenticación más robusta y reglas más estrictas. Sí, la seguridad también existe aunque a veces los prototipos la miren feo.
