# 🔐 Sistema de Autenticación Admin

## ✅ Cómo Funciona

El sistema de autenticación del admin está implementado completamente en **JavaScript** (frontend) usando **hash SHA-256** para semi-ocultar la contraseña.

### **Ventajas:**
- ✅ **Sin problemas de CORS** - No requiere llamadas a la API
- ✅ **Rápido** - Validación instantánea
- ✅ **Semi-seguro** - La contraseña no está en texto plano
- ✅ **Fácil de cambiar** - Usa el generador de hash incluido

### **Seguridad:**
- 🔒 La contraseña **NO** está en texto plano en el código
- 🔒 Solo está el hash SHA-256
- ⚠️ Alguien técnico podría descifrar el hash si revisa el código
- ✅ **Perfectamente adecuado** para tu caso educativo

---

## 🔑 Contraseña Actual

**Contraseña:** `Ldirinem2025`

**Hash SHA-256:** `7f6dbc05d620d3050960cd4cb3dedb8c08b1a9810964adeec21e2c0b3a22a3f3`

---

## 🔄 Cómo Cambiar la Contraseña

### **Opción 1: Usando el Generador (Recomendado)**

1. Abre el archivo **`generate-hash.html`** en tu navegador
2. Ingresa tu nueva contraseña deseada
3. Click en **"Generate Hash"**
4. Copia el hash generado
5. Abre **`Script.js`**
6. Ve a la línea **596** aproximadamente
7. Reemplaza el valor de `ADMIN_PASSWORD_HASH` con el nuevo hash

**Ejemplo:**
```javascript
// ANTES
const ADMIN_PASSWORD_HASH = '7f6dbc05d620d3050960cd4cb3dedb8c08b1a9810964adeec21e2c0b3a22a3f3';

// DESPUÉS (con nueva contraseña)
const ADMIN_PASSWORD_HASH = 'tu-nuevo-hash-aqui';
```

### **Opción 2: Online**

1. Ve a: https://emn178.github.io/online-tools/sha256.html
2. Ingresa tu contraseña
3. Copia el hash
4. Actualiza `Script.js` línea 596

### **Opción 3: Terminal (Linux/Mac)**

```bash
echo -n "TuNuevaContraseña" | sha256sum
```

---

## 💻 Implementación Técnica

### **Archivo: Script.js (líneas 593-605)**

```javascript
// Hash de la contraseña
const ADMIN_PASSWORD_HASH = '7f6dbc05d620d3050960cd4cb3dedb8c08b1a9810964adeec21e2c0b3a22a3f3';

// Función para calcular hash SHA-256
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
```

### **Validación (líneas 982-1032)**

```javascript
async function handleAdminLogin() {
    const password = adminPassword.value;

    // Calcular hash de la contraseña ingresada
    const inputHash = await sha256(password);

    // Comparar con el hash almacenado
    if (inputHash === ADMIN_PASSWORD_HASH) {
        // ✅ Acceso concedido
        isAdminMode = true;
        showAdminBanner();
    } else {
        // ❌ Acceso denegado
        showModalError('Invalid password');
    }
}
```

---

## 🔍 Flujo de Autenticación

```
1. Usuario ingresa contraseña
         ↓
2. JavaScript calcula SHA-256 hash
         ↓
3. Compara hash con ADMIN_PASSWORD_HASH
         ↓
4. Si coincide → Modo Admin activado ✅
5. Si no coincide → Error ❌
```

**Sin llamadas a servidor - Todo sucede en el navegador**

---

## 🛡️ Seguridad

### **Lo que protege:**
- ✅ La contraseña no está en texto plano
- ✅ No se envía la contraseña por la red
- ✅ Validación local rápida

### **Lo que NO protege:**
- ⚠️ Alguien que inspeccione el código puede ver el hash
- ⚠️ El hash podría ser descifrado con rainbow tables
- ⚠️ No protege contra ataques de fuerza bruta local

### **Para tu caso educativo:**
Esta implementación es **perfectamente adecuada** porque:
- Es un proyecto educativo
- Los estudiantes no son atacantes
- La contraseña solo da acceso a eliminar publicaciones
- No hay datos sensibles en juego

---

## 📝 Mejoras Futuras (Opcional)

Si en el futuro necesitas más seguridad:

1. **Usar Google OAuth** - Login con cuenta de Google
2. **Backend real** - Servidor Node.js/Python con autenticación robusta
3. **Salt + Hash** - Agregar un "salt" al hash para más seguridad
4. **Rate limiting** - Limitar intentos de login

---

## ❓ FAQ

### ¿Por qué SHA-256 y no MD5?
SHA-256 es más seguro y moderno que MD5.

### ¿Puedo usar múltiples contraseñas?
Sí, crea un array de hashes:
```javascript
const ADMIN_HASHES = [
    'hash1',
    'hash2',
    'hash3'
];

if (ADMIN_HASHES.includes(inputHash)) {
    // Acceso concedido
}
```

### ¿Qué pasa si olvido la contraseña?
Abre `generate-hash.html`, genera un nuevo hash, y actualiza `Script.js`.

---

## 🎯 Resumen

- 🔑 **Contraseña actual:** `Ldirinem2025`
- 📁 **Ubicación del hash:** `Script.js` línea 596
- 🛠️ **Generador de hash:** `generate-hash.html`
- ✅ **No requiere API** - Todo funciona en el navegador
- 🚫 **Sin problemas de CORS** - Validación local

---

**Última actualización:** 2025-11-07
**Sistema:** Autenticación local con SHA-256
