# Finansas 💰

App React Native + API Express + **PostgreSQL**.

Aplicación completa de gestión de finanzas personales con autenticación JWT, múltiples cuentas, presupuestos y gráficas.

---

## 📋 Guías Importantes

- **Base de datos**: [GUIA_BASE_DE_DATOS.md](./GUIA_BASE_DE_DATOS.md) - Cómo configurar PostgreSQL y pgAdmin

---

## 🚀 Inicio Rápido (Para Clonar el Repo)

### Backend
1. Copiar `backend/.env.example` → `backend/.env`
2. Editar `backend/.env` con tu contraseña de PostgreSQL
3. Crear BD `finanzas_db` en pgAdmin
4. Ejecutar `backend/sql/setup_completo.sql` en pgAdmin
5. Correr:
```powershell
cd backend
npm install
node index.js
```

### Frontend
1. Copiar `frontend/.env.example` → `frontend/.env`
2. **IMPORTANTE**: Editar `frontend/.env` y poner tu IP real:
   ```env
   # Para celular con Expo Go: tu IPv4 (usa ipconfig en PowerShell)
   REACT_APP_API_URL=http://192.168.X.X:3000/api
   
   # O para emulador Android:
   # REACT_APP_API_URL=http://10.0.2.2:3000/api
   ```
3. Correr:
```powershell
cd frontend
npm install
npx expo start -c
```

---

## 🔧 Configuración de la IP (IMPORTANTE)

### Para Celular Físico (Expo Go)
1. En tu PC, abre PowerShell y ejecuta:
   ```powershell
   ipconfig
   ```
2. Busca tu IPv4 (ej: `192.168.1.50`)
3. Edita `frontend/.env`:
   ```env
   REACT_APP_API_URL=http://192.168.1.50:3000/api
   ```
4. Asegúrate que celular y PC están en **la misma Wi-Fi**
5. Recarga la app (presiona `r` en Expo)

### Para Emulador Android
Usa esta dirección en `frontend/.env`:
```env
REACT_APP_API_URL=http://10.0.2.2:3000/api
```

### Para Pruebas en la Misma PC (Navegador)
```env
REACT_APP_API_URL=http://localhost:3000/api
```

---

## ✅ Verificar Conexión

Después de configurar, prueba que todo funciona:

1. **Backend corriendo** → verás: `✅ CONEXIÓN A BASE DE DATOS EXITOSA`
2. **Frontend** → intenta registrarte
3. Si falla → revisa que:
   - [ ] Backend esté corriendo en `node index.js`
   - [ ] La IP en `.env` sea correcta
   - [ ] Celular y PC en la misma Wi-Fi
   - [ ] Desde navegador del celular puedas acceder a `http://TU_IP:3000/api/health`
