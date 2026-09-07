ELECTRO VARIETY - PROYECTO COMPLETO STOCK DEPÓSITO + LOCAL

Archivos web:
- index.html: catálogo, 20 productos por página, categorías/productos A-Z, stock total visible y WhatsApp.
- admin.html: administrador principal, productos, importador, vendedores, creación de cuentas de stock y aprobación/rechazo de solicitudes.
- stock-deposito.html: acceso independiente para Depósito.
- stock-local.html: acceso independiente para Local.
- config.js: conexión Supabase.

Base de datos:
- migracion_stock_dual.sql: tablas, RLS, solicitudes y función de aprobación. Ejecutar una vez en Supabase SQL Editor.

Funciones Edge requeridas:
- supabase/functions/create-stock-user/index.ts
- supabase/functions/delete-stock-user/index.ts

Estas dos funciones permiten que el administrador cree/elimine cuentas de stock desde admin.html. Requieren la variable secreta SUPABASE_SERVICE_ROLE_KEY en Supabase. No colocar esa clave en GitHub ni en el navegador.

Flujo:
1. Admin crea cuenta y elige Depósito o Local.
2. Cada cuenta entra en su URL independiente con celular + contraseña.
3. Modifica solamente su propio inventario.
4. Envía una solicitud.
5. Admin aprueba o rechaza.
6. Al aprobar, el stock visible del catálogo queda Depósito + Local.

IMPORTANTE: desplegar las dos Edge Functions antes de probar la creación de cuentas desde el panel.
