# F2Fit Wellness Tracker - MVP

Sistema de registro diario de bienestar físico, emocional y hábitos para usuarias de F2Fit.

## ⚡ Setup Rápido (2 minutos)

### Backend
```bash
cd backend
npm install
npm start
# ✓ API corriendo en http://localhost:3000
```

### Mobile
```bash
cd mobile
npm install
npx expo start -c
# Escanear QR con Expo Go app
```

## ✅ Criterios de Aceptación Cumplidos

### Criterio 1: Registro rápido de bienestar
- ✅ Acceso desde Home con 1 tap
- ✅ Escala visual 1-5 para energía física y estado emocional
- ✅ Campo opcional de notas (máx 100 caracteres)
- ✅ Guardado inmediato

### Criterio 2: Checklist de hábitos
- ✅ 4 hábitos fijos: Ejercicio, Hidratación, Sueño, Alimentación
- ✅ Toggle on/off con feedback inmediato (haptic)
- ✅ Reset automático a las 00:00 (por índice único user_id + date)
- ✅ Persistencia inmediata

### Criterio 3: Accesibilidad del registro
- ✅ Disponible sin depender de entrenar
- ✅ Se puede actualizar durante el día (sobrescribe con INSERT OR REPLACE)
- ✅ Funciona offline y sincroniza al recuperar conexión (AsyncStorage)

## 🛠️ Stack Tecnológico

### Backend
- **Node.js + Express**: API REST simple
- **SQLite**: Persistencia sin configuración
- **Zod**: Validación de datos runtime

**Justificación:**
- SQLite = cero config, archivo local, perfecto para MVP
- Express = mínimo boilerplate, estándar de la industria
- Zod = validación type-safe compartible con frontend

### Frontend
- **React Native + Expo**: Multiplataforma
- **AsyncStorage**: Offline-first
- **React Navigation**: Navegación nativa

**Justificación:**
- Expo = no necesita Xcode/Android Studio
- AsyncStorage = built-in, suficiente para MVP
- React Navigation = estándar, fácil de usar

## 📊 API Endpoints

### POST /api/wellness
Crear o actualizar registro (upsert)

**Request:**
```json
{
  "user_id": "test_user_123",
  "date": "2024-03-15",
  "physical_energy": 4,
  "emotional_state": 3,
  "notes": "Día productivo",
  "habits": {
    "exercise": true,
    "hydration": true,
    "sleep": false,
    "nutrition": true
  }
}
```

**Response:** `201 Created`

### GET /api/wellness/:userId/:date
Obtener registro de fecha específica

**Response:** `200 OK` o `404 Not Found`

### GET /api/wellness/:userId?last=7
Obtener historial de últimos N días

## 🧪 Testing

```bash
cd backend
npm test
```

**Tests incluidos:**
- ✅ Validación de datos correctos
- ✅ Rechazo de physical_energy fuera de rango (1-5)
- ✅ Rechazo de notas >100 caracteres
- ✅ Aceptación de notas opcionales

## 🎯 Decisiones de Arquitectura (500 palabras)

### Arquitectura MVP Simple

Elegí una arquitectura **minimalista** porque es un MVP. El backend completo está en `server.js` (~180 líneas) con 3 endpoints. No necesito capas de abstracción (Controller, Service, Repository) cuando la lógica cabe en una pantalla y es fácil de entender.

### SQLite para Cero Configuración

PostgreSQL requeriría instalación, configuración y conexión. SQLite crea un archivo `.db` automáticamente sin setup. Para un MVP con <10K usuarios es perfecto. Si crece, migrar es trivial:
```javascript
// Cambiar 1 línea:
const db = new sqlite3.Database('./wellness.db');
// Por:
const { Pool } = require('pg');
const db = new Pool({ connectionString: process.env.DATABASE_URL });
```

### Validación con Zod

Zod valida en runtime lo que TypeScript no puede. El mismo schema podría usarse en frontend para consistencia (DRY). Runtime type-checking previene errores que llegan al cliente.

### Offline-First Simple

No necesito una librería compleja como Redux Persist. AsyncStorage + fetch es suficiente:
1. Guardar en AsyncStorage inmediatamente (UX instantánea)
2. POST a servidor en background
3. Si falla → mensaje "se sincronizará después"
4. Próximo intento → retry automático

Esto cumple el criterio "funciona offline" sin over-engineering.

### Reset Automático de Hábitos

El "reset a las 00:00" se resuelve con índice único `(user_id, date)` en DB:
- Cada día es una entrada nueva
- Si usuario registra 2 veces el mismo día → sobrescribe (INSERT OR REPLACE)
- No necesito cronjobs ni procesos complejos

**Por qué funciona:**
```sql
PRIMARY KEY (user_id, date)
```
Garantiza una entrada por usuario por día. Los hábitos empiezan en `false` por defecto cada nuevo día.

### React Native sin Custom Hooks

No usé custom hooks ni patrones complejos porque para un MVP:
- La lógica en `WellnessScreen.js` es clara y directa
- No hay reutilización entre pantallas (solo 2 screens)
- Mantener simple > elegante

Si creciera a 10+ pantallas, refactorizaría a custom hooks. Para MVP, YAGNI (You Aren't Gonna Need It).

### Patrones Aplicados (Mínimos Necesarios)

**Container/Presenter implícito:**
- `HomeScreen` y `WellnessScreen` son containers (lógica + UI)
- Componentes inline son presenters (UI pura)

**Service Layer básico:**
- `fetch()` abstrae HTTP en funciones `save()`
- Sin clase ni módulo separado (overkill para 2 llamadas)

### Trade-offs Conscientes

**No incluí:**
- TypeScript: Priorizar velocidad de desarrollo
- Custom hooks: No hay reutilización que justifique abstracción
- Redux/Zustand: AsyncStorage + useState es suficiente
- Docker: Complica setup ("sin configuración compleja")
- Gráficas: Bonus opcional, no core

**Sí incluí:**
- Tests unitarios (requisito mínimo: 1 función crítica)
- Validación dual (seguridad)
- Error handling básico
- Feedback haptic (UX)

### Casos Edge Considerados

1. **Validación:** Zod previene datos inválidos
2. **Fechas futuras:** Validadas en backend
3. **Offline:** AsyncStorage + retry
4. **Sobrescritura:** INSERT OR REPLACE permite actualizar mismo día

### Escalabilidad Futura

Si crece a 100K+ usuarios:
1. Migrar SQLite → PostgreSQL (cambio trivial)
2. Separar endpoints en archivos (refactor simple)
3. Agregar autenticación (JWT)
4. TypeScript para type-safety

La arquitectura simple permite **refactorizar incrementalmente** sin rewrites.

### Conclusión

Este MVP balancea **simplicidad** (setup 2min, ~350 líneas total) con **profesionalismo** (tests, validación, offline-first). Cumple 100% de criterios sin over-engineering. Es código production-ready que puede evolucionar sin reescrituras completas.

## 🐛 Troubleshooting

**Backend no inicia:**
```bash
# Verificar puerto 3000 libre
lsof -i:3000
# Matar proceso si está ocupado
kill -9 $(lsof -ti:3000)
```

**Mobile no conecta al backend:**
```bash
# Si usas dispositivo físico, cambia en WellnessScreen.js:
const API_URL = 'http://TU_IP_LOCAL:3000/api/wellness';

# Encuentra tu IP:
# Windows: ipconfig
# Mac/Linux: ifconfig | grep "inet "
```

**Tests fallan:**
```bash
cd backend
rm -rf node_modules
npm install
npm test
```

## 📁 Estructura del Proyecto

```
f2fit-wellness/
├── backend/
│   ├── server.js           # API completa (~180 líneas)
│   ├── wellness.test.js    # Test unitario
│   ├── package.json
│   └── wellness.db         # (se crea automáticamente)
│
├── mobile/
│   ├── App.js              # Navegación
|   ├── Index.js            # Iniciar Expo
│   ├── HomeScreen.js       # Home con 1-tap access
│   ├── WellnessScreen.js   # Formulario completo
│   ├── package.json
│   └── app.json
│
└── README.md
```

**Total:  Simple, completo, funcional.**

## 📄 Licencia Davids Developers programar es mi arte (2025)