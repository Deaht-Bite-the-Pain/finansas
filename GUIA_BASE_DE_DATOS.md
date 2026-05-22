# Guía: PostgreSQL + pgAdmin 4 para Finansas

## ¿Qué es cada cosa?

| Programa | Qué hace |
|----------|----------|
| **PostgreSQL** | El motor de base de datos (guarda los datos) |
| **pgAdmin 4** | Programa visual para ver y administrar PostgreSQL (no es otro motor, es la “ventana”) |

Al instalar PostgreSQL en Windows, normalmente **pgAdmin 4 se instala junto**.

---

## Paso 1: Instalar PostgreSQL (si no lo tienes)

1. Descarga: https://www.postgresql.org/download/windows/
2. Instala con las opciones por defecto.
3. Durante la instalación te pedirá una **contraseña para el usuario `postgres`**. **Anótala** (la usarás siempre).
4. Puerto por defecto: **5432**.

---

## Paso 2: Abrir pgAdmin 4 y conectar

1. Abre **pgAdmin 4** desde el menú Inicio.
2. En el panel izquierdo: **Servers** → **PostgreSQL 16** (o la versión que tengas).
3. Te pedirá la contraseña de `postgres` → la que pusiste al instalar.

---

## Paso 3: Crear la base de datos del proyecto

1. Clic derecho en **Databases** → **Create** → **Database...**
2. Nombre: `finanzas_db`
3. Clic en **Save**.

---

## Paso 4: Crear las tablas (script SQL)

1. Clic en **finanzas_db** → menú **Tools** → **Query Tool** (Herramienta de consultas).
2. Abre el archivo del proyecto:
   `backend/sql/setup_completo.sql`
3. Copia **todo** el contenido y pégalo en el Query Tool.
4. Pulsa **Execute** (▶) o F5.
5. Abajo debe decir **Success** / **Query returned successfully**.

Para comprobar: en el panel izquierdo, **finanzas_db** → **Schemas** → **public** → **Tables**. Deberías ver: `usuarios`, `cuentas`, `categorias`, `transacciones`, `presupuestos`.

---

## Paso 5: Configurar el backend (.env)

Edita `backend/.env` con tu contraseña real:

```env
PORT=3000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=finanzas_db
DB_PASSWORD=LA_CONTRASEÑA_QUE_PUSISTE_AL_INSTALAR
DB_PORT=5432
JWT_SECRET=secreto_desafio_udb_2026
```

---

## Paso 6: Arrancar el backend

En PowerShell:

```powershell
cd "c:\Users\Danil\Downloads\finansas-main\finansas-main\backend"
npm install
node index.js
```

Debe aparecer: `Servidor corriendo en puerto 3000`. **Deja esta ventana abierta.**

---

## Paso 7: Configurar la app (IP)

Edita `frontend/src/api/axios.js`:

- **Celular con Expo Go** (misma Wi‑Fi): tu IPv4 de `ipconfig` → `http://192.168.x.x:3000/api`
- **Emulador Android**: `http://10.0.2.2:3000/api`

---

## Paso 8: Arrancar la app móvil

En **otra** terminal:

```powershell
cd "c:\Users\Danil\Downloads\finansas-main\finansas-main\frontend"
npm install
npm start
```

Escanea el QR con Expo Go o usa el emulador.

---

## Orden de ejecución (resumen)

1. PostgreSQL corriendo (servicio Windows, normalmente automático)
2. Tablas creadas en pgAdmin (`setup_completo.sql`)
3. Backend: `node index.js`
4. Frontend: `npm start`

---

## Problemas frecuentes

| Error | Solución |
|-------|----------|
| `password authentication failed` | Contraseña incorrecta en `backend/.env` |
| `database "finanzas_db" does not exist` | Crear la base en pgAdmin (Paso 3) |
| `relation "usuarios" does not exist` | Ejecutar `setup_completo.sql` (Paso 4) |
| La app no conecta | IP correcta en `axios.js`, backend encendido, misma red Wi‑Fi |
