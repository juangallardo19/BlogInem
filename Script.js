// URL de tu Google Apps Script - ACTUALIZA ESTA URL CON LA NUEVA
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQXD1x37jz4n9zlGhedVD7jomKCyQpxA8v9c18g8SuA6nKnhUYah_u5ZI3bsNurBYY/exec';

// Elementos del DOM
const form = document.getElementById('experienceForm');
const audioInput = document.getElementById('audioFile');
const videoInput = document.getElementById('videoFile');
const audioFileName = document.getElementById('audioFileName');
const videoFileName = document.getElementById('videoFileName');
const audioUploadArea = document.getElementById('audioUploadArea');
const videoUploadArea = document.getElementById('videoUploadArea');
const audioPreview = document.getElementById('audioPreview');
const videoPreview = document.getElementById('videoPreview');
const audioPlayer = document.getElementById('audioPlayer');
const videoPlayer = document.getElementById('videoPlayer');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');

// Manejo de archivos de audio
audioInput.addEventListener('change', function(e) {
    console.log('Audio file selected:', this.files.length); // Debug
    if (this.files.length > 0) {
        const file = this.files[0];
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        console.log('Audio file details:', file.name, file.type, fileSize + ' MB'); // Debug
        
        // Actualizar texto
        audioFileName.innerHTML = `<strong>${file.name}</strong><br><small>Size: ${fileSize} MB</small>`;
        audioUploadArea.classList.add('has-file');
        
        // Mostrar preview
        const fileURL = URL.createObjectURL(file);
        audioPlayer.src = fileURL;
        audioPreview.style.display = 'block';
        
        // Ocultar área de upload
        audioUploadArea.style.display = 'none';
        
        console.log('Audio preview should be visible now'); // Debug
    }
});

// Manejo de archivos de video
videoInput.addEventListener('change', function(e) {
    console.log('Video file selected:', this.files.length); // Debug
    if (this.files.length > 0) {
        const file = this.files[0];
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        console.log('Video file details:', file.name, file.type, fileSize + ' MB'); // Debug
        
        // Actualizar texto
        videoFileName.innerHTML = `<strong>${file.name}</strong><br><small>Size: ${fileSize} MB</small>`;
        videoUploadArea.classList.add('has-file');
        
        // Mostrar preview
        const fileURL = URL.createObjectURL(file);
        videoPlayer.src = fileURL;
        videoPreview.style.display = 'block';
        
        // Ocultar área de upload
        videoUploadArea.style.display = 'none';
        
        console.log('Video preview should be visible now'); // Debug
    }
});

// Función para remover audio
function removeAudio() {
    console.log('Removing audio file'); // Debug
    audioInput.value = '';
    audioPlayer.src = '';
    audioPreview.style.display = 'none';
    audioUploadArea.style.display = 'flex';
    audioFileName.innerHTML = 'Click here to select audio file';
    audioUploadArea.classList.remove('has-file');
}

// Función para remover video
function removeVideo() {
    console.log('Removing video file'); // Debug
    videoInput.value = '';
    videoPlayer.src = '';
    videoPreview.style.display = 'none';
    videoUploadArea.style.display = 'flex';
    videoFileName.innerHTML = 'Click here to select video file';
    videoUploadArea.classList.remove('has-file');
}

// Prevenir comportamiento por defecto en drag & drop
[audioUploadArea, videoUploadArea].forEach(area => {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, preventDefaults, false);
    });
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Efectos visuales al arrastrar - Audio
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

// Efectos visuales al arrastrar - Video
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
        // Verificar que sea un archivo de audio
        const file = files[0];
        if (file.type.startsWith('audio/')) {
            audioInput.files = files;
            const event = new Event('change', { bubbles: true });
            audioInput.dispatchEvent(event);
        } else {
            showMessage('Please select a valid audio file', 'error');
        }
    }
});

// Manejar archivos arrastrados - Video
videoUploadArea.addEventListener('drop', function(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        // Verificar que sea un archivo de video
        const file = files[0];
        if (file.type.startsWith('video/')) {
            videoInput.files = files;
            const event = new Event('change', { bubbles: true });
            videoInput.dispatchEvent(event);
        } else {
            showMessage('Please select a valid video file', 'error');
        }
    }
});

// Función para mostrar mensajes
function showMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message show ' + type;
    
    // Auto-hide success and error messages after 5 seconds
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
    
    console.log('Form submitted'); // Debug
    
    // Validar campos
    const studentName = document.getElementById('studentName').value.trim();
    const experience = document.getElementById('experience').value.trim();
    
    if (!studentName || !experience) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    // Deshabilitar botón
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <svg class="icon-btn" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Uploading...
    `;
    showMessage('Processing your submission... Please wait.', 'loading');
    
    try {
        // Recopilar datos
        const formData = {
            studentName: studentName,
            experience: experience,
            timestamp: new Date().toISOString()
        };
        
        console.log('Basic form data:', formData); // Debug
        
        // Procesar audio si existe
        if (audioInput.files.length > 0) {
            const audioFile = audioInput.files[0];
            showMessage('Processing audio file...', 'loading');
            console.log('Processing audio file:', audioFile.name); // Debug
            
            const audioData = await fileToBase64(audioFile);
            formData.audioFile = {
                name: audioFile.name,
                mimeType: audioFile.type,
                data: audioData
            };
            console.log('Audio file processed'); // Debug
        }
        
        // Procesar video si existe
        if (videoInput.files.length > 0) {
            const videoFile = videoInput.files[0];
            showMessage('Processing video file...', 'loading');
            console.log('Processing video file:', videoFile.name); // Debug
            
            const videoData = await fileToBase64(videoFile);
            formData.videoFile = {
                name: videoFile.name,
                mimeType: videoFile.type,
                data: videoData
            };
            console.log('Video file processed'); // Debug
        }
        
        showMessage('Sending to Google Drive...', 'loading');
        console.log('Sending data to:', SCRIPT_URL); // Debug
        console.log('Data size:', JSON.stringify(formData).length, 'characters'); // Debug
        
        // Enviar a Google Apps Script
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Response status:', response.status); // Debug
        
        // Intentar leer la respuesta
        const responseText = await response.text();
        console.log('Response text:', responseText); // Debug
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
            console.log('Parsed response:', responseData); // Debug
        } catch (parseError) {
            console.log('Could not parse response as JSON'); // Debug
            responseData = { success: true }; // Asumir éxito si no podemos parsear
        }
        
        // Mostrar éxito
        if (responseData.success !== false) {
            showMessage('Success! Your experience has been submitted and saved to Google Drive.', 'success');
            
            // Limpiar formulario
            form.reset();
            removeAudio();
            removeVideo();
        } else {
            showMessage('Error: ' + (responseData.message || 'Unknown error occurred'), 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error submitting your experience. Please try again. Error: ' + error.message, 'error');
    } finally {
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg class="icon-btn" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            Post Experience
        `;
    }
});

// Debug: Verificar que todos los elementos existen al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, checking elements:');
    console.log('Audio input:', audioInput);
    console.log('Video input:', videoInput);
    console.log('Audio preview:', audioPreview);
    console.log('Video preview:', videoPreview);
    console.log('Audio upload area:', audioUploadArea);
    console.log('Video upload area:', videoUploadArea);
});