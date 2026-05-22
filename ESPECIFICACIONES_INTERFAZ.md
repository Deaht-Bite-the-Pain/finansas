# 💰 FINANSAS - Especificaciones de Interfaz para Diseñador

## 📱 Descripción General de la App

**FINANSAS** es una aplicación móvil de gestión de finanzas personales que permite a los usuarios:
- Registrar y categorizar sus ingresos y gastos
- Gestionar múltiples cuentas bancarias/efectivo
- Establecer presupuestos mensuales por categoría
- Visualizar estadísticas y gráficas de sus finanzas
- Monitorear alertas de gastos excesivos

**Público objetivo:** Personas que desean controlar y analizar sus finanzas personales.

**Tipo de app:** Aplicación móvil en React Native (iOS y Android).

---

## 🎨 Especificaciones de Diseño

### **Paleta de Colores Sugerida**
- **Primario:** Azul (#2563eb)
- **Éxito/Ingreso:** Verde (#16a34a)
- **Alerta/Gasto:** Rojo (#dc2626)
- **Advertencia:** Naranja (#f59e0b)
- **Fondo:** Gris claro (#f5f5f5)
- **Texto:** Gris oscuro (#333333)

### **Tipografía**
- **Títulos:** Bold, 24-28px
- **Subtítulos:** SemiBold, 18-20px
- **Etiquetas:** Medium, 14px
- **Texto normal:** Regular, 14-16px

---

## 📋 INTERFAZ POR PANTALLA

---

## 1️⃣ PANTALLA DE LOGIN

### **Objetivo**
Permitir que usuarios existentes inicien sesión con email y contraseña.

### **Elementos que DEBE tener**
- ✅ Título: "Iniciar Sesión" (arriba, centrado)
- ✅ Campo de entrada: Email (placeholder: "Email")
- ✅ Campo de entrada: Contraseña (password, placeholder: "Contraseña")
- ✅ Botón: "Ingresar" (color primario, ancho completo)
- ✅ Botón: "Crear cuenta nueva" (color gris, ancho completo)
- ✅ Mensaje de estado flotante (verde para éxito, rojo para error) - aparece arriba de los campos
- ✅ Indicador de carga (spinner) en el botón mientras se procesa

### **Comportamiento**
- Al hacer clic en "Ingresar": valida email y contraseña, muestra spinner
- Si falla: muestra mensaje rojo flotante + Alert con error
- Si éxito: muestra mensaje verde flotante + navega al Dashboard después de 1.5s
- Los inputs se deshabilitan mientras se envía la solicitud
- Al hacer clic en "Crear cuenta nueva": navega a Pantalla de Registro

### **Validaciones a mostrar**
- Email vacío: "Email obligatorio"
- Contraseña vacía: "Contraseña obligatoria"
- Email inválido: mostrar error

---

## 2️⃣ PANTALLA DE REGISTRO

### **Objetivo**
Permitir que nuevos usuarios creen una cuenta.

### **Elementos que DEBE tener**
- ✅ Título: "Crear Cuenta" (arriba, centrado)
- ✅ Campo de entrada: Email (placeholder: "Email")
- ✅ Campo de entrada: Contraseña (password, placeholder: "Contraseña (mín. 6 caracteres)")
- ✅ Botón: "Registrarse" (color primario, ancho completo)
- ✅ Botón: "Volver al Login" (color gris, ancho completo)
- ✅ Mensaje de estado flotante (verde para éxito, rojo para error)
- ✅ Indicador de carga (spinner) mientras se procesa

### **Comportamiento**
- Al hacer clic en "Registrarse": valida campos, muestra spinner
- Si falla: muestra mensaje rojo flotante + Alert con razón del error
- Si éxito: muestra mensaje verde "✅ ¡Éxito! Usuario registrado correctamente" + navega a Login después de 2s
- Los inputs se deshabilitan mientras se envía
- Al hacer clic en "Volver al Login": navega a Pantalla de Login

### **Validaciones a mostrar**
- Email vacío: "Email obligatorio"
- Email inválido: "Email inválido"
- Contraseña vacía: "Contraseña obligatoria"
- Contraseña < 6 caracteres: "Mínimo 6 caracteres"
- Email ya registrado: mostrar error del servidor

---

## 3️⃣ PANTALLA DASHBOARD (Principal)

### **Objetivo**
Mostrar un resumen completo de las finanzas del mes actual.

### **Elementos que DEBE tener** (en orden de arriba a abajo)

#### **Sección 1: Header**
- ✅ Título: "Dashboard Financiero"
- ✅ Subtítulo: Mes y año actual (ej. "Mayo 2026")

#### **Sección 2: Tarjetas de Resumen** (3 tarjetas lado a lado o apiladas)
- ✅ **Tarjeta 1 - Ingresos**
  - Etiqueta: "Ingresos"
  - Monto: +$1000.00 (color verde)
  
- ✅ **Tarjeta 2 - Gastos**
  - Etiqueta: "Gastos"
  - Monto: -$250.00 (color rojo)
  
- ✅ **Tarjeta 3 - Saldo Neto**
  - Etiqueta: "Saldo Neto"
  - Monto: +$750.00 (color verde si es positivo, rojo si es negativo)

#### **Sección 3: Gráfica de Barras**
- ✅ Título: "Ingresos vs Gastos"
- ✅ Gráfica con 2 barras (Ingresos y Gastos)
- ✅ Eje Y con montos ($)
- ✅ Solo muestra si hay datos

#### **Sección 4: Saldo por Cuenta**
- ✅ Título: "Saldo por Cuenta"
- ✅ Lista de tarjetas (una por cada cuenta):
  - Nombre de la cuenta (ej. "Mi Efectivo")
  - Tipo de cuenta (ej. "Efectivo")
  - Saldo actual (ej. "$1000.00") - en color azul
- ✅ Si no hay cuentas: mostrar "No hay cuentas registradas"

#### **Sección 5: Gráfica de Torta**
- ✅ Título: "Distribución de Gastos"
- ✅ Gráfica de torta mostrando top 5 categorías de gastos
- ✅ Colores diferentes para cada categoría
- ✅ Solo muestra si hay gastos

#### **Sección 6: Desglose Detallado de Gastos**
- ✅ Título: "Gastos por Categoría (Detalle)"
- ✅ Para cada categoría:
  - Nombre de la categoría
  - Monto gastado ($250.00)
  - Barra de progreso visual (% del total de gastos)
  - Porcentaje (45.5%)
- ✅ Ordenadas de mayor a menor gasto
- ✅ Si no hay gastos: mostrar "No hay gastos registrados este mes"

#### **Sección 7: Botones de Navegación** (abajo)
- ✅ Botón: "Ver Transacciones" (azul)
- ✅ Botón: "Ver Presupuestos" (azul oscuro)
- ✅ Botón: "Mis Cuentas" (verde)

### **Comportamiento**
- Al hacer clic en "Ver Transacciones": navega a Pantalla de Transacciones
- Al hacer clic en "Ver Presupuestos": navega a Pantalla de Presupuestos
- Al hacer clic en "Mis Cuentas": navega a Pantalla de Cuentas
- Los datos se actualizan cada vez que se regresa a esta pantalla
- Si no hay datos: mostrar mensajes vacíos apropiados

---

## 4️⃣ PANTALLA DE CUENTAS

### **Objetivo**
Listar todas las cuentas del usuario y permitir crear nuevas.

### **Elementos que DEBE tener**

#### **Header**
- ✅ Título: "Mis Cuentas"

#### **Botones de Navegación** (primero)
- ✅ Botón: "Crear Nueva Cuenta" (azul, ancho completo)
- ✅ Botón: "Transacciones" (gris, ancho completo)
- ✅ Botón: "Presupuestos" (azul oscuro, ancho completo)

#### **Lista de Cuentas**
- ✅ Para cada cuenta mostrar una tarjeta con:
  - Nombre de la cuenta (ej. "Mi Efectivo")
  - Tipo (ej. "Efectivo")
  - Saldo actual (color azul, más grande)
- ✅ Si no hay cuentas: mostrar "No tienes cuentas creadas aún."

#### **Botón Cerrar Sesión** (abajo)
- ✅ Botón: "Cerrar Sesión" (rojo, ancho completo)

### **Comportamiento**
- Al hacer clic en "Crear Nueva Cuenta": navega a Pantalla de Agregar Cuenta
- Al hacer clic en "Transacciones": navega a Pantalla de Transacciones
- Al hacer clic en "Presupuestos": navega a Pantalla de Presupuestos
- Al hacer clic en "Cerrar Sesión": cierra sesión y vuelve a Login
- Las cuentas se actualizan cada vez que se regresa a esta pantalla

---

## 5️⃣ PANTALLA DE AGREGAR CUENTA

### **Objetivo**
Permitir crear una nueva cuenta (efectivo, banco, tarjeta, etc).

### **Elementos que DEBE tener**
- ✅ Título: "Agregar Nueva Cuenta"
- ✅ Campo: Nombre (placeholder: "Nombre (ej. Efectivo)")
- ✅ Campo: Tipo (placeholder: "Tipo (ej. Banco)")
- ✅ Botón: "Guardar Cuenta" (azul, ancho completo)
- ✅ Botón: "Cancelar" (gris, ancho completo)

### **Comportamiento**
- Al hacer clic en "Guardar Cuenta": valida que ambos campos estén llenos, envía al servidor
- Si éxito: muestra "Cuenta creada" y vuelve atrás
- Si falla: muestra error
- Al hacer clic en "Cancelar": vuelve atrás sin guardar

---

## 6️⃣ PANTALLA DE TRANSACCIONES

### **Objetivo**
Listar todas las transacciones y permitir filtrarlas, crearlas, editarlas o eliminarlas.

### **Elementos que DEBE tener**

#### **Header**
- ✅ Título: "Transacciones"
- ✅ Botón toggle: "▼ Abrir Filtros" / "▲ Cerrar Filtros"

#### **Panel de Filtros** (expandible)
- ✅ **Dropdown Categoría**: "Todas las categorías" (predeterminado)
- ✅ **Dropdown Cuenta**: "Todas las cuentas" (predeterminado)
- ✅ **Selector Fecha Desde**: (ej. 2026-05-01)
- ✅ **Selector Fecha Hasta**: (ej. 2026-05-22)
- ✅ Botón: "Limpiar Filtros" (rojo)

#### **Botón Crear**
- ✅ Botón: "Nueva transacción" (azul, ancho completo)

#### **Lista de Transacciones**
- ✅ Para cada transacción mostrar tarjeta con:
  - **Descripción** (ej. "Café")
  - **Monto** (color verde si es ingreso: +$50.00, rojo si es gasto: -$50.00)
  - **Metadata**: Categoría · Cuenta · Fecha (gris, pequeño)
  - **Hint**: "Toca para editar · Mantén para eliminar" (gris muy pequeño)
- ✅ Si no hay transacciones: mostrar "No hay transacciones con estos filtros."

#### **Botón Volver** (abajo)
- ✅ Botón: "Volver" (gris)

### **Comportamiento**
- Al hacer clic en "Abrir Filtros": expande el panel de filtros
- Al cambiar filtros: la lista se actualiza automáticamente
- Al hacer clic en "Limpiar Filtros": resetea todos los filtros
- Al hacer clic en una transacción: navega a Pantalla de Editar Transacción
- Al mantener presionado una transacción: muestra diálogo "¿Eliminar esta transacción?" con opciones Cancelar/Eliminar
- Al hacer clic en "Nueva transacción": navega a Pantalla de Crear Transacción
- Al hacer clic en "Volver": vuelve atrás

---

## 7️⃣ PANTALLA DE FORMULARIO DE TRANSACCIÓN (Crear/Editar)

### **Objetivo**
Crear una nueva transacción o editar una existente.

### **Elementos que DEBE tener**

#### **Header**
- ✅ Título: "Nueva transacción" (si es crear) o "Editar transacción" (si es editar)

#### **Formulario**
- ✅ **Tipo**: 2 botones (Gasto/Ingreso) - seleccionar uno (Gasto es predeterminado)
- ✅ **Monto**: Campo numérico (placeholder: "0.00")
  - ✅ Mostrar error si está vacío o es ≤ 0: "El monto debe ser mayor a 0"
- ✅ **Descripción**: Campo de texto (placeholder: "Descripción")
- ✅ **Fecha**: Campo de fecha (placeholder: "YYYY-MM-DD")
  - ✅ Validar formato, mostrar error si es inválido
- ✅ **Cuenta**: Lista de cuentas (seleccionar una)
  - ✅ Mostrar: "Nombre ($Saldo)" (ej. "Mi Efectivo ($1000.00)")
  - ✅ Mostrar error si no selecciona: "Debe seleccionar una cuenta"
- ✅ **Categoría**: Lista de categorías según el tipo (Ingreso/Gasto)
  - ✅ Mostrar error si no selecciona: "Debe seleccionar una categoría"
- ✅ **Botón "Guardar"**: (azul, ancho completo)
  - ✅ Muestra "Guardando..." mientras se envía
  - ✅ Deshabilitado mientras se procesa
- ✅ **Botón "Cancelar"**: (gris, ancho completo)
  - ✅ Deshabilitado mientras se procesa

#### **Estilos de Error**
- ✅ Campos con error: borde rojo, fondo rojo claro
- ✅ Mensajes de error: texto rojo pequeño debajo del campo

### **Comportamiento**
- El tipo es "Gasto" por defecto
- Al cambiar tipo: se actualizan las categorías disponibles
- Al hacer clic en "Guardar": valida todos los campos
  - Si hay errores: muestra mensajes rojos en cada campo
  - Si es válido: envía al servidor
- Si éxito: muestra "Transacción creada/actualizada correctamente" y vuelve atrás
- Si falla: muestra error
- Al hacer clic en "Cancelar": vuelve atrás sin guardar

---

## 8️⃣ PANTALLA DE PRESUPUESTOS

### **Objetivo**
Visualizar presupuestos mensuales por categoría y crear/editar presupuestos.

### **Elementos que DEBE tener**

#### **Header**
- ✅ Título: "Presupuestos mensuales"

#### **Navegador de Mes**
- ✅ Botón: "<" (anterior)
- ✅ Mes y año actual (ej. "Mayo 2026") - centrado
- ✅ Botón: ">" (siguiente)

#### **Botón Crear**
- ✅ Botón: "Configurar presupuesto" (azul, ancho completo)

#### **Lista de Presupuestos**
- ✅ Para cada presupuesto mostrar tarjeta con:
  - **Nombre de la categoría** (ej. "Comida")
  - **Límite**: "Límite: $500.00" (gris, pequeño)
  - **Barra de progreso** visual que muestra:
    - Relleno: porcentaje del límite consumido
    - Color según alerta:
      - Verde: < 80%
      - Amarillo: 80-99%
      - Rojo: 100%+
    - Etiqueta de estado arriba:
      - Verde: "Dentro del presupuesto"
      - Amarillo: "Alerta: 80% del límite"
      - Rojo: "Límite superado (100%+)"
    - Porcentaje al lado: "45.5%"
  - **Detalles**: "$225.00 / $500.00" (gasto actual / límite)
  - **Hint**: "Toca para editar · Mantén para eliminar" (gris muy pequeño)
- ✅ Si no hay presupuestos: "No hay presupuestos para este mes. Crea uno por categoría de gasto."

#### **Botón Volver** (abajo)
- ✅ Botón: "Volver" (gris)

### **Comportamiento**
- Al cambiar mes (< o >): actualiza la lista de presupuestos para ese mes
- Al hacer clic en "Configurar presupuesto": navega a Pantalla de Formulario de Presupuesto
- Al hacer clic en un presupuesto: navega a Pantalla de Editar Presupuesto
- Al mantener presionado un presupuesto: muestra diálogo "¿Eliminar este presupuesto?" con Cancelar/Eliminar
- Al hacer clic en "Volver": vuelve atrás

---

## 9️⃣ PANTALLA DE FORMULARIO DE PRESUPUESTO (Crear/Editar)

### **Objetivo**
Crear o editar un presupuesto mensual para una categoría.

### **Elementos que DEBE tener**

#### **Header**
- ✅ Título: "Nuevo presupuesto" (si es crear) o "Editar presupuesto" (si es editar)
- ✅ Subtítulo: "Período: Mes/Año" (ej. "Período: 5/2026")

#### **Formulario**

**Si es CREAR:**
- ✅ **Categoría**: Lista de categorías de gasto (botones o dropdown)
  - Mostrar cada categoría seleccionable
  - Mostrar error si no selecciona: "Debe seleccionar una categoría"

**Si es EDITAR:**
- ✅ La categoría NO se muestra (ya está seleccionada)

- ✅ **Límite mensual ($)**: Campo numérico (placeholder: "Ej. 500")
  - ✅ Mostrar error si está vacío o es ≤ 0: "El límite debe ser mayor a 0"

- ✅ **Nota informativa**: "Las alertas se muestran al alcanzar el 80% (amarillo) y el 100% (rojo) del límite."

- ✅ **Botón "Guardar"**: (azul, ancho completo)
  - ✅ Muestra "Guardando..." mientras se envía
  - ✅ Deshabilitado mientras se procesa
- ✅ **Botón "Cancelar"**: (gris, ancho completo)
  - ✅ Deshabilitado mientras se procesa

### **Comportamiento**
- Al hacer clic en "Guardar": valida campos
  - Si hay errores: muestra mensajes rojos
  - Si es válido: envía al servidor
- Si éxito: muestra "Presupuesto creado/actualizado correctamente" y vuelve atrás
- Si falla: muestra error
- Al hacer clic en "Cancelar": vuelve atrás sin guardar

---

## 🎯 NOTAS IMPORTANTES PARA EL DISEÑADOR

### **Que DEBE mantener funcional:**
1. ✅ **Navegación entre pantallas**: Los botones deben mantener su `onPress` handler
2. ✅ **Inputs y Selects**: Los campos deben poder ser editables y capturar datos
3. ✅ **Validaciones visuales**: Mostrar errores en rojo cuando se indique
4. ✅ **Estados de carga**: Mostrar spinner cuando el botón diga "Guardando..."
5. ✅ **Mensajes flotantes**: Los cuadros verdes/rojos deben aparecer en su posición actual
6. ✅ **Barras de progreso**: Deben mantener su ancho dinámico (% calculado)
7. ✅ **Gráficas**: Deben mantener su tamaño y estructura (barras, torta)
8. ✅ **Listas**: Deben poder scrollear si hay muchos elementos

### **Que PUEDE cambiar libremente:**
- 🎨 Colores (manteniendo contraste)
- 📐 Espaciado y márgenes
- 🔤 Tipografía y tamaños
- 📦 Orden de elementos (siempre y cuando mantenga la lógica)
- ✨ Animaciones y transiciones
- 🎭 Estilos visuales (sombras, bordes redondeados, etc.)

### **NO debe cambiar:**
- ❌ Nombres de pantallas (Login, Register, Dashboard, etc.)
- ❌ Nombres de botones (si cambia el texto, los desarrolladores no sabrán cómo identificarlos)
- ❌ Estructura de campos en formularios
- ❌ Flujo de navegación

---

## 📞 CONTACTO CON DESARROLLADORES

Si el diseñador tiene dudas sobre funcionalidad específica de alguna pantalla, puede contactar con el equipo de desarrollo antes de empezar el rediseño.

**¡Listo para rediseñar!** 🚀
