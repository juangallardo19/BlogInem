// ⚠️ IMPORTANTE: Reemplaza esta URL con la URL de tu Google Apps Script
const SCRIPT_URL = 'https://script.google.com/a/macros/inempasto.edu.co/s/AKfycbyQXD1x37jz4n9zlGhedVD7jomKCyQpxA8v9c18g8SuA6nKnhUYah_u5ZI3bsNurBYY/exec';

// Elementos del DOM
const form = document.getElementById('experienceForm');
const audioInput = document.getElementById('audioFile');
const videoInput = document.getElementById('videoFile');
const audioFileName = document.getElementById('audioFileName');
const videoFileName = document.getElementById('videoFileName');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');
const experiencesList = document.getElementById('experiencesList');

// Mostrar nombre de archivos seleccionados
audioInput.addEventListener('change', function(e) {
    if (this.files.length > 0) {
        audioFileName.textContent = this.files[0].name;
        audioFileName.classList.add('has-file');
    } else {
        audioFileName.textContent = 'No se eligió ningún archivo';
        audioFileName.classList.remove('has-file');
    }
});

videoInput.addEventListener('change', function(e) {
    if (this.files.length > 0) {
        videoFileName.textContent = this.files[0].name;
        videoFileName.classList.add('has-file');
    } else {
        videoFileName.textContent = 'No se eligió ningún archivo';
        videoFileName.classList.remove('has-file');
    }
});

// Hacer los labels clickeables
audioFileName.addEventListener('click', () => audioInput.click());
videoFileName.addEventListener('click', () => videoInput.click());

// Función para mostrar mensajes
function showMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message show ' + type;
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusMessage.classList.remove('show');
        }, 5000);
    }
}

// Función para convertir archivo a Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Extraer solo la parte Base64 (sin el prefijo data:...)
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Manejar envío del formulario
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validar que la URL del script esté configurada
    if (SCRIPT_URL === 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI') {
        showMessage('⚠️ Error: Debes configurar la URL del Google Apps Script en script.js', 'error');
        return;
    }
    
    // Deshabilitar botón y mostrar loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    showMessage('Subiendo tu experiencia...', 'loading');
    
    try {
        // Recopilar datos del formulario
        const formData = {
            studentName: document.getElementById('studentName').value,
            experience: document.getElementById('experience').value,
            timestamp: new Date().toISOString()
        };
        
        // Procesar archivos si existen
        if (audioInput.files.length > 0) {
            const audioFile = audioInput.files[0];
            formData.audioFile = {
                name: audioFile.name,
                mimeType: audioFile.type,
                data: await fileToBase64(audioFile)
            };
        }
        
        if (videoInput.files.length > 0) {
            const videoFile = videoInput.files[0];
            formData.videoFile = {
                name: videoFile.name,
                mimeType: videoFile.type,
                data: await fileToBase64(videoFile)
            };
        }
        
        // Enviar a Google Apps Script
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Importante para Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // Como usamos no-cors, no podemos leer la respuesta
        // Asumimos que fue exitoso si no hubo error
        showMessage('✅ ¡Experiencia publicada exitosamente!', 'success');
        
        // Limpiar formulario
        form.reset();
        audioFileName.textContent = 'No se eligió ningún archivo';
        videoFileName.textContent = 'No se eligió ningún archivo';
        audioFileName.classList.remove('has-file');
        videoFileName.classList.remove('has-file');
        
        // Recargar experiencias
        setTimeout(() => {
            loadExperiences();
        }, 1000);
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('❌ Error al enviar. Por favor intenta nuevamente.', 'error');
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Experience';
    }
});

// Cargar experiencias existentes
async function loadExperiences() {
    try {
        const response = await fetch(SCRIPT_URL + '?action=getExperiences');
        const data = await response.json();
        
        if (data.experiences && data.experiences.length > 0) {
            displayExperiences(data.experiences);
        } else {
            experiencesList.innerHTML = '<div class="no-experiences">No hay experiencias aún. ¡Sé el primero en compartir!</div>';
        }
    } catch (error) {
        console.error('Error loading experiences:', error);
        experiencesList.innerHTML = '<div class="no-experiences">No se pudieron cargar las experiencias.</div>';
    }
}

// Mostrar experiencias en la página
function displayExperiences(experiences) {
    // Ordenar por fecha más reciente
    experiences.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    experiencesList.innerHTML = experiences.map(exp => {
        const date = new Date(exp.timestamp).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let filesHtml = '';
        if (exp.audioUrl || exp.videoUrl) {
            filesHtml = '<div class="files">';
            if (exp.audioUrl) {
                filesHtml += `<a href="${exp.audioUrl}" target="_blank" class="file-link">🎤 Audio</a>`;
            }
            if (exp.videoUrl) {
                filesHtml += `<a href="${exp.videoUrl}" target="_blank" class="file-link">🎥 Video</a>`;
            }
            filesHtml += '</div>';
        }
        
        return `
            <div class="experience-card">
                <h3>${escapeHtml(exp.studentName)}</h3>
                <div class="date">${date}</div>
                <div class="text">${escapeHtml(exp.experience)}</div>
                ${filesHtml}
            </div>
        `;
    }).join('');
}

// Función para escapar HTML y prevenir XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Cargar experiencias al iniciar la página
if (SCRIPT_URL !== 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI') {
    loadExperiences();
} else {
    experiencesList.innerHTML = '<div class="no-experiences">⚠️ Configura la URL del Google Apps Script para ver las experiencias.</div>';
}