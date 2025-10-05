# Instalación Paso a Paso - F2Fit Wellness

## Prerequisitos

✅ **Node.js 20+** instalado ([Descargar aquí](https://nodejs.org))  
✅ **Expo Go** en tu teléfono descargalo desde tu tienda apps:
- [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
- [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## PASO 1: ## CLONAR el repositorio de github:
```bash
git clone https://github.com/DavidsSaavedraDev/f2fitWellness.git
```

### Instalar dependencias BACKEND

```bash
cd backend
npm install
```

**Deberías ver instalación**

### Verificar instalación

```bash
npm start
```

**Resultado esperado:**
```
╔════════════════════════════════════╗
║  F2Fit Wellness API                ║
║  http://localhost:3000             ║
╚════════════════════════════════════╝
✓ SQLite conectada
```

### Probar API

```bash
# En otra terminal
curl http://localhost:3000/health
```

**Respuesta esperada:**
```json
{"status":"ok","timestamp":"2025-..."}
```

✅ **Backend listo y funcionando!**

---

## PASO 3: Setup Mobile

## recuerda que debes usar expo go en tu mobile para scanear el qr de la app

### Instalar dependencias PARA INSTALACION DEBES ABRIR LA CONSOLO COMO ADMINISTRADOR Y NO TENER EL PROYECTO EN USO CERRAR CODE
## Instala con legacy peer deps
```bash
cd mobile
npm install 
```

**Este proceso puede tomar 3-5 minutos. Es normal.**

### Configurar IP local (IMPORTANTE)

Edita `mobile/WellnessScreen.js` línea 17:

```javascript
// Encuentra tu IP con: ipconfig (Windows) o ifconfig (Mac)
const API_URL = 'http://TU_IP_LOCAL:3000/api/wellness';
// Ejemplo: const API_URL = 'http:// 192.168.15.35:3000/api/wellness';
```

### Iniciar Expo

```bash
npx expo start -c
```

**Resultado esperado:**
```
› Metro waiting on exp://192.168.X.X:8081
› Scan the QR code above with Expo Go
```

✅ **Mobile listo!**

---

## PASO 4: Probar en tu teléfono

### Android:
1. Abre **Expo Go**
2. Toca "Scan QR code"
3. Escanea el QR de la terminal

### iOS:
1. Abre app **Cámara**
2. Apunta al QR
3. Toca la notificación
4. Se abre en Expo Go

**Tiempo de carga: ~30 segundos**

---

## PASO 5: Verificación completa

### En la app deberías ver:
1. Pantalla "F2Fit Wellness"
2. Botón grande rosa "✨ Registrar Mi Día"
3. Al tocar se abre el formulario

### Prueba completa:
1. Selecciona energía física (1-5)
2. Selecciona estado emocional (1-5)
3. Activa algunos hábitos
4. Escribe una nota (opcional)
5. Toca "Guardar"
6. Deberías ver "✅ Guardado"

---

## PASO 6: Ejecutar tests

```bash
cd backend
npm test
```

**Resultado esperado:**
```
PASS  wellness.test.js
  ✓ debe validar datos correctos
  ✓ debe rechazar physical_energy fuera de rango
  ✓ debe rechazar notas mayores a 100 caracteres
  ✓ debe aceptar datos sin notas

Tests: 4 passed, 4 total
```

---

## Troubleshooting

### Error en mobile: "Project incompatible"
Tu Expo Go está desactualizado. Actualízalo desde la tienda de apps.

### Error: "Cannot connect to server"
1. Verifica que el backend está corriendo
2. Verifica que cambiaste la IP en WellnessScreen.js
3. Asegúrate de estar en la misma WiFi

### Backend: "Port 3000 in use"
```bash
# Windows PowerShell
netstat -ano | findstr :3000
taskkill /PID  /F
```

---

## Comandos Útiles

```bash
# Backend
cd backend
npm start        # Iniciar
npm test         # Tests

# Mobile
cd mobile
npm start                 # Iniciar
npx expo start --clear    # Limpiar cache
```

---

## ¿Todo funcionó?

Si llegaste aquí sin errores, tienes:
- ✅ Backend funcionando en Node 20
- ✅ API REST con SQLite
- ✅ App móvil en Expo SDK 52
- ✅ Tests pasando
- ✅ **Instalación LIMPIA sin warnings críticos**

