# 📚 BlogInem API Documentation

## 📝 Descripción General

Esta API permite gestionar experiencias de estudiantes de inglés, incluyendo la capacidad de:
- Enviar nuevas experiencias con archivos multimedia
- Obtener todas las experiencias publicadas
- Validar credenciales de administrador
- Eliminar experiencias (requiere autenticación de admin)

**Versión:** 4.0
**Base URL:** Tu URL de Google Apps Script desplegada
**Formato:** JSON

---

## 🔑 Autenticación

La API utiliza validación por contraseña para operaciones administrativas.

**Contraseña Admin:** `Ldirinem2025`

---

## 📡 Endpoints

### 1. GET - Información de la API

**Endpoint:** `GET /`

**Descripción:** Obtiene información básica sobre la API y sus endpoints disponibles.

**Parámetros:** Ninguno

**Respuesta:**
```json
{
  "success": true,
  "message": "Student Experience API is running",
  "timestamp": "2025-11-06T10:30:00.000Z",
  "info": "Use POST method to submit experiences",
  "version": "4.0",
  "endpoints": {
    "POST": [
      "action=submitExperience (default)",
      "action=validateAdmin",
      "action=deleteExperiencia"
    ],
    "GET": [
      "action=getExperiencias"
    ]
  }
}
```

---

### 2. GET - Obtener Todas las Experiencias

**Endpoint:** `GET /?action=getExperiencias`

**Descripción:** Obtiene todas las experiencias publicadas ordenadas cronológicamente (más recientes primero).

**Parámetros de Query:**
- `action=getExperiencias` (requerido)

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Experiences retrieved successfully",
  "data": [
    {
      "id": "EXP-1699315200000-1234",
      "timestamp": "2025-11-06T10:00:00.000Z",
      "studentName": "Juan Pérez",
      "experience": "Mi experiencia aprendiendo inglés ha sido...",
      "audioUrl": "https://drive.google.com/file/...",
      "videoUrl": "https://drive.google.com/file/...",
      "folderUrl": "https://drive.google.com/drive/folders/...",
      "documentUrl": "https://docs.google.com/document/...",
      "folderId": "1ABC...xyz"
    }
  ],
  "count": 15,
  "timestamp": "2025-11-06T10:30:00.000Z"
}
```

**Respuesta Sin Datos:**
```json
{
  "success": true,
  "message": "No experiences found",
  "data": [],
  "count": 0,
  "timestamp": "2025-11-06T10:30:00.000Z"
}
```

**Respuesta de Error:**
```json
{
  "success": false,
  "message": "Error description here",
  "error": "ErrorType",
  "timestamp": "2025-11-06T10:30:00.000Z"
}
```

---

### 3. POST - Enviar Nueva Experiencia

**Endpoint:** `POST /`

**Descripción:** Crea una nueva experiencia de estudiante con archivos multimedia opcionales.

**Content-Type:** `application/json`

**Body:**
```json
{
  "action": "submitExperience",
  "studentName": "María García",
  "experience": "Mi experiencia ha sido increíble porque...",
  "timestamp": "2025-11-06T10:00:00.000Z",
  "audioFile": {
    "name": "recording.mp3",
    "mimeType": "audio/mpeg",
    "data": "BASE64_ENCODED_DATA_HERE"
  },
  "videoFile": {
    "name": "video.mp4",
    "mimeType": "video/mp4",
    "data": "BASE64_ENCODED_DATA_HERE"
  }
}
```

**Campos:**
- `action` (opcional): "submitExperience" - Por defecto si se omite
- `studentName` (requerido): Nombre completo del estudiante
- `experience` (requerido): Texto de la experiencia
- `timestamp` (requerido): Fecha/hora en formato ISO 8601
- `audioFile` (opcional): Objeto con archivo de audio en Base64
- `videoFile` (opcional): Objeto con archivo de video en Base64

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "action": "submitExperience",
  "data": {
    "id": "EXP-1699315200000-1234",
    "studentName": "María García",
    "timestamp": "2025-11-06T10:00:00.000Z",
    "audioUrl": "https://drive.google.com/file/...",
    "videoUrl": "https://drive.google.com/file/...",
    "folderUrl": "https://drive.google.com/drive/folders/...",
    "documentUrl": "https://docs.google.com/document/...",
    "audioFileName": "recording.mp3",
    "videoFileName": "video.mp4",
    "folderId": "1ABC...xyz"
  },
  "timestamp": "2025-11-06T10:00:30.000Z"
}
```

**Límites de Archivos:**
- Audio: Máximo 25 MB
- Video: Máximo 100 MB

---

### 4. POST - Validar Credenciales de Admin

**Endpoint:** `POST /`

**Descripción:** Valida si la contraseña proporcionada es correcta para acceso administrativo.

**Content-Type:** `application/json`

**Body:**
```json
{
  "action": "validateAdmin",
  "password": "Ldirinem2025"
}
```

**Campos:**
- `action` (requerido): "validateAdmin"
- `password` (requerido): Contraseña a validar

**Respuesta Exitosa (Contraseña Correcta):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "action": "validateAdmin",
  "data": {
    "valid": true,
    "message": "Authentication successful"
  },
  "timestamp": "2025-11-06T10:30:00.000Z"
}
```

**Respuesta Exitosa (Contraseña Incorrecta):**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "action": "validateAdmin",
  "data": {
    "valid": false,
    "message": "Invalid password"
  },
  "timestamp": "2025-11-06T10:30:00.000Z"
}
```

---

### 5. POST - Eliminar Experiencia

**Endpoint:** `POST /`

**Descripción:** Elimina una experiencia específica por ID. **Requiere autenticación de admin.**

**Content-Type:** `application/json`

**Body:**
```json
{
  "action": "deleteExperiencia",
  "id": "EXP-1699315200000-1234",
  "password": "Ldirinem2025"
}
```

**Campos:**
- `action` (requerido): "deleteExperiencia"
- `id` (requerido): ID único de la experiencia a eliminar
- `password` (requerido): Contraseña de administrador

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "action": "deleteExperiencia",
  "data": {
    "deleted": true,
    "id": "EXP-1699315200000-1234",
    "message": "Experience deleted successfully"
  },
  "timestamp": "2025-11-06T10:35:00.000Z"
}
```

**Respuesta de Error (No Autorizado):**
```json
{
  "success": false,
  "message": "Unauthorized: Invalid admin credentials",
  "error": "Error",
  "timestamp": "2025-11-06T10:35:00.000Z"
}
```

**Respuesta de Error (ID No Encontrado):**
```json
{
  "success": false,
  "message": "Experience with ID \"EXP-XXX\" not found",
  "error": "Error",
  "timestamp": "2025-11-06T10:35:00.000Z"
}
```

---

## 🗂️ Estructura de Datos

### Objeto Experience

```typescript
{
  id: string,              // ID único (formato: EXP-timestamp-random)
  timestamp: string,       // Fecha ISO 8601
  studentName: string,     // Nombre del estudiante
  experience: string,      // Texto de la experiencia
  audioUrl: string | null, // URL de Google Drive o null
  videoUrl: string | null, // URL de Google Drive o null
  folderUrl: string | null,   // URL de la carpeta en Drive
  documentUrl: string | null, // URL del documento de Google Docs
  folderId: string | null     // ID de la carpeta en Drive
}
```

---

## 📊 Base de Datos (Google Sheets)

**Nombre:** `Student Experiences Database`

**Columnas:**

| # | Nombre | Tipo | Descripción |
|---|--------|------|-------------|
| A | ID | String | ID único de la experiencia |
| B | Timestamp | Date | Fecha y hora de creación |
| C | Student Name | String | Nombre del estudiante |
| D | Experience | String | Texto de la experiencia |
| E | Audio URL | String | URL del archivo de audio |
| F | Video URL | String | URL del archivo de video |
| G | Folder URL | String | URL de la carpeta en Drive |
| H | Document URL | String | URL del documento descriptivo |
| I | Folder ID | String | ID de la carpeta (para eliminación) |

---

## 🔒 Seguridad

### Recomendaciones de Implementación:

1. **Contraseña Admin:**
   - Cambiar la contraseña por defecto en producción
   - Almacenar en Script Properties en lugar de constante
   - Usar hashing si es posible

2. **Validación Frontend:**
   - Validar tamaños de archivos antes de enviar
   - Validar tipos de archivos permitidos
   - Implementar rate limiting si es necesario

3. **Permisos de Drive:**
   - Verificar que la carpeta de Drive tenga permisos adecuados
   - Los archivos se configuran como ANYONE_WITH_LINK por defecto

4. **CORS:**
   - El código usa `mode: 'no-cors'` para evitar problemas de CORS
   - En producción, considerar configurar CORS adecuadamente

---

## ⚠️ Manejo de Errores

Todos los endpoints devuelven errores en el siguiente formato:

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "TipoDeError",
  "timestamp": "2025-11-06T10:30:00.000Z",
  "debug": {
    "hasE": true,
    "hasPostData": true,
    "hasContents": true
  }
}
```

### Códigos de Error Comunes:

- `Missing required fields`: Faltan campos obligatorios
- `Invalid JSON data`: Datos JSON malformados
- `Cannot access Google Drive folder`: Problema de permisos
- `Unauthorized`: Credenciales admin inválidas
- `Experience with ID "..." not found`: ID no existe

---

## 🧪 Testing

### Función de Prueba Incluida:

Ejecuta `testDriveAccess()` en el editor de Google Apps Script para:
- Verificar acceso a la carpeta de Drive
- Crear carpeta de prueba
- Crear archivo de prueba
- Verificar spreadsheet
- Generar ID de prueba
- Agregar fila de prueba

---

## 📈 Futuras Mejoras Sugeridas

1. **Paginación:** Agregar parámetros `page` y `limit` a getExperiencias
2. **Filtros:** Permitir filtrar por nombre de estudiante, fecha, etc.
3. **Edición:** Endpoint para editar experiencias existentes
4. **Búsqueda:** Búsqueda por texto en experiencias
5. **Estadísticas:** Endpoint con estadísticas (total, por mes, etc.)
6. **Webhooks:** Notificaciones cuando se crean nuevas experiencias
7. **Autenticación OAuth:** Sistema más robusto para administradores múltiples

---

## 📞 Contacto y Soporte

Para problemas o preguntas sobre la API:
- Revisar los logs en Google Apps Script
- Verificar permisos de la carpeta de Drive
- Consultar la documentación de Google Apps Script

---

**Última actualización:** 2025-11-06
**Versión de la API:** 4.0
