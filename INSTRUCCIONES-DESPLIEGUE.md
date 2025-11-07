# 🚀 INSTRUCCIONES PARA SOLUCIONAR EL ERROR DE CORS

## ❌ Problema Actual

Estás viendo este error:
```
Access to fetch has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present
```

Esto ocurre porque el script.gs que tienes desplegado en Google Apps Script **NO tiene la función doOptions()** que maneja los "preflight requests" de CORS.

---

## ✅ SOLUCIÓN (Sigue estos pasos EXACTAMENTE)

### Paso 1: Abrir tu Google Apps Script

1. Ve a: https://script.google.com
2. Abre tu proyecto actual (donde está tu script)

### Paso 2: Actualizar el Código

1. **BORRA TODO EL CÓDIGO** que tienes actualmente en el editor
2. **COPIA TODO** el contenido del archivo `script.gs` de este repositorio
3. **PÉGALO** en el editor de Google Apps Script
4. Click en el ícono de **Guardar** (💾)

### Paso 3: Crear NUEVO Despliegue

**⚠️ IMPORTANTE: NO actualices el despliegue viejo, crea uno NUEVO**

1. Click en el botón **"Implementar"** (arriba a la derecha)
2. Click en **"Nueva implementación"**
3. Click en el ícono de engranaje ⚙️ junto a "Select type"
4. Selecciona **"Aplicación web"**
5. Configura así:
   - **Descripción**: "Version 5.0 - CORS Fixed"
   - **Ejecutar como**: **"Yo" (tu email)**
   - **Quién tiene acceso**: **"Cualquier persona"** (o "Anyone")
6. Click en **"Implementar"**

### Paso 4: Copiar la Nueva URL

Después del despliegue verás un mensaje con una URL como:
```
https://script.google.com/macros/s/AKfycb...NUEVA_URL.../exec
```

**COPIA ESTA URL COMPLETA**

### Paso 5: Actualizar Script.js (YA HECHO ✅)

Ya actualicé el archivo `Script.js` con tu URL actual. Cuando hagas el nuevo despliegue, si la URL cambia, debes actualizar la línea 4 de `Script.js`:

```javascript
const SCRIPT_URL = 'TU_NUEVA_URL_AQUI';
```

---

## 🔍 Verificar que Funcionó

Después de estos pasos:

1. Abre tu aplicación en el navegador
2. Abre la consola (F12)
3. Recarga la página
4. **NO deberías ver más errores de CORS**
5. Las experiencias deberían cargar
6. Los videos/audios deberían reproducirse

---

## 📝 Lo que Cambió en script.gs

### Nueva Función Añadida: doOptions()

Esta función maneja los "preflight requests" que el navegador envía antes de hacer POST/DELETE:

```javascript
function doOptions(e) {
  Logger.log('=== OPTIONS REQUEST (CORS Preflight) ===');

  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

Sin esta función, Google Apps Script rechaza los requests con error de CORS.

---

## 🎯 Funcionalidades que Deben Funcionar

Después del despliegue correcto:

✅ Cargar experiencias del foro (GET request)
✅ Enviar nueva experiencia con audio/video (POST request)
✅ Login de admin (LOCAL - no usa API)
✅ Eliminar experiencias en modo admin (POST request)
✅ Reproducir audio/video directamente en el foro
✅ Paginación y búsqueda

---

## ❓ ¿Aún tienes Problemas?

Si después de seguir TODOS estos pasos aún ves errores:

1. Verifica que copiaste **TODO** el código de script.gs (706 líneas)
2. Verifica que creaste un **NUEVO despliegue** (no actualizar el viejo)
3. Verifica que seleccionaste **"Cualquier persona"** en "Quién tiene acceso"
4. Limpia la caché del navegador (Ctrl + Shift + Delete)
5. Prueba en modo incógnito

---

## 🔗 URLs Importantes

- **URL Actual en Script.js**: `https://script.google.com/macros/s/AKfycbxGcfjoASChBvvAtTKf_DN6GMv0pFiyTNThbhsvIMDeu2oxyFEC5T_8hlQAHFPWDyCh/exec`

- **Google Apps Script**: https://script.google.com

- **Repositorio**: https://github.com/juangallardo19/BlogInem
