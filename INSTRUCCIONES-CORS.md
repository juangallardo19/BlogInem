# 🔧 SOLUCIÓN AL PROBLEMA DE CORS

## ⚠️ PROBLEMA IDENTIFICADO

El error que estás viendo:
```
Access to fetch at '...' has been blocked by CORS policy
```

Significa que Google Apps Script está bloqueando las peticiones desde tu dominio (https://blog-inem.vercel.app).

## ✅ SOLUCIÓN IMPLEMENTADA

He actualizado el código para evitar CORS usando **GET requests** en lugar de POST para el login de admin.

---

## 📝 PASOS PARA SOLUCIONAR (SIGUE ESTOS PASOS EXACTAMENTE)

### **Paso 1: Actualizar Google Apps Script**

1. Ve a [script.google.com](https://script.google.com)
2. Abre tu proyecto actual
3. **BORRA TODO EL CÓDIGO ACTUAL**
4. Abre el archivo `script-CORS-FIXED.gs` de este repositorio
5. **COPIA TODO EL CONTENIDO** y pégalo en Google Apps Script
6. **Guarda** (Ctrl+S o File > Save)

### **Paso 2: Publicar Nueva Versión**

1. Click en **"Deploy"** (arriba a la derecha)
2. Click en **"Manage deployments"**
3. Click en el **ícono de lápiz ✏️** (editar el deployment existente)
4. En **"Version"**, selecciona **"New version"**
5. Descripción: "CORS fix - Changed admin validation to GET"
6. Click en **"Deploy"**
7. La URL debería seguir siendo la misma

### **Paso 3: Verificar que Funciona**

1. Abre `test-api.html` en tu navegador
2. Espera a que se ejecute automáticamente Test 1
3. Deberías ver: ✅ PASSED
4. Click en "Run Test 2" - Debería mostrar tus experiencias
5. Asegúrate de que la contraseña sea `Ldirinem2025` y click en "Run Test 3"
6. Deberías ver: ✅ PASSED - Password is CORRECT!

### **Paso 4: Probar el Login en la Página Real**

1. Abre tu página: https://blog-inem.vercel.app
2. Baja hasta la sección "Shared Experiences"
3. Click en el botón **"Admin"**
4. Ingresa contraseña: `Ldirinem2025`
5. Click en **"Login"**
6. Deberías ver el banner rojo "Administrator Mode Active"
7. Deberías ver botones de "Delete" en cada publicación

---

## 🔍 CAMBIOS TÉCNICOS REALIZADOS

### **En script-CORS-FIXED.gs:**
- ✅ Agregada función `validateAdminGet()` que maneja GET requests
- ✅ Modificado `doGet()` para aceptar `action=validateAdmin`
- ✅ La contraseña se envía como query parameter en lugar de body
- ✅ Versión actualizada a: `4.1-CORS-FIXED`

### **En Script.js:**
- ✅ Cambiado de POST a GET para validación de admin
- ✅ URL: `${SCRIPT_URL}?action=validateAdmin&password=${password}`
- ✅ Ya no envía headers personalizados (no hay CORS preflight)

---

## 🎯 ¿POR QUÉ ESTO SOLUCIONA EL PROBLEMA?

**El problema original:**
- POST con `Content-Type: application/json` dispara una **preflight request** (OPTIONS)
- Google Apps Script NO maneja OPTIONS requests por defecto
- Resultado: Error CORS

**La solución:**
- GET requests NO disparan preflight
- La contraseña va en la URL (query parameters)
- Google Apps Script maneja GET sin problemas
- Resultado: ¡Funciona sin CORS!

---

## 📊 TESTING

### Test 1: API Básica
```
GET https://tu-url.../exec
Esperado: success: true, version: "4.1-CORS-FIXED"
```

### Test 2: Cargar Experiencias
```
GET https://tu-url.../exec?action=getExperiencias
Esperado: success: true, count: X, data: [...]
```

### Test 3: Validar Admin
```
GET https://tu-url.../exec?action=validateAdmin&password=Ldirinem2025
Esperado: success: true, data: { valid: true }
```

---

## ⚠️ NOTA DE SEGURIDAD

**IMPORTANTE:** La contraseña ahora va en la URL como query parameter. Esto significa que:
- ✅ Funciona sin CORS
- ⚠️ La contraseña es visible en la URL (menos seguro)

**Para un entorno de producción real**, considera:
- Usar HTTPS (ya lo tienes ✅)
- Cambiar la contraseña regularmente
- Usar autenticación más robusta (OAuth, JWT, etc.)

Para tu caso educativo actual, esta solución es **perfectamente adecuada**.

---

## 🐛 SI AÚN NO FUNCIONA

### Abre la Consola del Navegador:
- Chrome/Edge: F12
- Firefox: F12
- Safari: Cmd+Option+I

### Busca errores y comparte:
1. Mensajes en rojo en la consola
2. La pestaña "Network" - busca la petición fallida
3. El status code de la respuesta

---

## 📞 RESUMEN RÁPIDO

1. ✅ Copia `script-CORS-FIXED.gs` a Google Apps Script
2. ✅ Deploy nueva versión
3. ✅ Prueba con `test-api.html`
4. ✅ Prueba login en la página real
5. ✅ Disfruta del sistema funcionando!

---

**Última actualización:** 2025-11-07
**Versión:** 4.1-CORS-FIXED
