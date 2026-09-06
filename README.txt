ELECTRO VARIETY V5 — LISTO PARA PUBLICAR

1. Supabase ya está configurado.
2. Subí index.html, admin.html y config.js al hosting.
3. Abrí /admin.html para administrar.
4. Abrí /index.html para vendedores.
5. El catálogo consulta productos activos directamente desde Supabase.

IMPORTANTE:
- config.js usa una Publishable key, no una service_role/secret key.
- El administrador requiere login de Supabase.
- Antes de producción, probá subir, editar, ocultar y publicar un producto.
- El bucket product-images debe ser público y tener las políticas de Storage creadas anteriormente.

GitHub Pages:
- Crear repositorio.
- Subir los 3 archivos.
- Settings > Pages > Deploy from branch > main / root.
- Usar la URL que GitHub genere.
