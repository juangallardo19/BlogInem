// ⚠️ IMPORTANTE: URL de tu Google Apps Script
const SCRIPT_URL = 'https://script.google.com/a/macros/inempasto.edu.co/s/AKfycbx920VEH1x3l2kf9-DBbS8-OpWpDWQXgmTV1b-45M4KKNnanadhp8e_ke9O7BE2u0ln/exec';

// Elementos del DOM
const form = document.getElementById('experienceForm');
const audioInput = document.getElementById('audioFile');
const videoInput = document.getElementById('videoFile');
const audioFileName = document.getElementById('audioFileName');
const videoFileName = document.getElementById('videoFileName');
const audioUploadArea = document.getElementById('audioUploadArea');
const videoUploadArea = document.getElementById('videoUploadArea');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');
const experiencesList = document.getElementById('experiencesList');

// Mostrar nombre de archivos seleccionados - Audio
audioInput.addEventListener('change', function(e) {
    if (this.files.length > 0) {
        const file = this.files[0];
        const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB
        audioFileName.innerHTML = `<strong>${file.name}</strong><br><small>Tamaño: ${fileSize} MB</small>`;
        audioUploadArea.classList.add('has-file');
    } else {
        audioFileName.innerHTML = 'Click aquí para seleccionar archivo de audio';
        audioUploadArea.classList.remove('has-file');
    }
});

// Mostrar nombre de archivos seleccionados - Video
videoInput.addEventListener('change', function(e) {
    if (this.files.length > 0) {
        const file = this.files[0];
        const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB
        videoFileName.innerHTML = `<strong>${file.name}</strong><br><small>Tamaño: ${fileSize} MB</small>`;
        videoUploadArea.classList.add('has-file');
    } else {
        videoFileName.innerHTML = 'Click aquí para seleccionar archivo de video';
        videoUploadArea.classList.remove('has-file');
    }
});

// Prevenir comportamiento por defecto en el área de drop
[audioUploadArea, videoUploadArea].forEach(area => {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, preventDefaults, false);
    });
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Efectos visuales al arrastrar archivos
audioUploadArea.addEventListener('dragenter', function() {
    this.style.borderColor = '#3b82f6';
    this.style.background = '#dbeafe';
});

audioUploadArea.addEventListener('dragleave', function() {
    if (!audioInput.files.length) {
        this.style.borderColor = '#d1d5db';
        this.style.background = '#f9fafb';
    }
});

videoUploadArea.addEventListener('dragenter', function() {
    this.style.borderColor = '#3b82f6';
    this.style.background = '#dbeafe';
});

videoUploadArea.addEventListener('dragleave', function() {
    if (!videoInput.files.length) {
        this.style.borderColor = '#d1d5db';
        this.style.background = '#f9fafb';
    }
});

// Manejar archivos arrastrados - Audio
audioUploadArea.addEventListener('drop', function(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        audioInput.files = files;
        // Disparar evento change manualmente
        const event = new Event('change', { bubbles: true });
        audioInput.dispatchEvent(event);
    }
});

// Manejar archivos arrastrados - Video
videoUploadArea.addEventListener('drop', function(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        videoInput.files = files;
        // Disparar evento change manualmente
        const event = new Event('change', { bubbles: true });
        videoInput.dispatchEvent(event);
    }
});

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
        audioFileName.innerHTML = 'Click aquí para seleccionar archivo de audio';
        videoFileName.innerHTML = 'Click aquí para seleccionar archivo de video';
        audioUploadArea.classList.remove('has-file');
        videoUploadArea.classList.remove('has-file');
        
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