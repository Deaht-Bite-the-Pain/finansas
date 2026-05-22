# Finansas

App React Native + API Express + **PostgreSQL**.

Guía detallada de base de datos (pgAdmin 4): **[GUIA_BASE_DE_DATOS.md](./GUIA_BASE_DE_DATOS.md)**

## Para compañeros que clonan el repo

1. Clonar el repositorio
2. Copiar `backend/.env.example` → `backend/.env` y poner su contraseña de PostgreSQL
3. Crear `finanzas_db` en pgAdmin y ejecutar `backend/sql/setup_completo.sql`
4. `cd backend` → `npm install` → `node index.js`
5. En `frontend/src/api/axios.js` poner la **IP de su PC** (no la tuya)
6. `cd frontend` → `npm install` → `npx expo start -c`

## Inicio rápido

1. Crear BD `finanzas_db` en pgAdmin y ejecutar `backend/sql/setup_completo.sql`
2. Configurar `backend/.env` (contraseña de postgres)
3. Backend: `cd backend` → `npm install` → `node index.js`
4. Frontend: configurar IP en `frontend/src/api/axios.js` → `npm install` → `npm start`
