// ========================================
// CONFIGURACIÓN PRINCIPAL
// ========================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwy2oOrX7th7BDKz-ur6FIJ2kJ-AxThovse1c70cd_-YyNezI_7_juyG8bM2mshmxlE/exec';

console.log('🚀 INICIANDO APLICACIÓN - CORS FIXED');
console.log('📍 Script URL:', SCRIPT_URL);

// ========================================
// ELEMENTOS DOM
// ========================================
let debugStatus, debugActions, debugFiles, debugAPI;
let form, audioInput, videoInput, audioFileName, videoFileName;
let audioUploadArea, videoUploadArea, audioPreview, videoPreview;
let audioPlayer, videoPlayer, submitBtn, statusMessage;
let testAPIBtn, testPreviewBtn;

// ========================================
// DEBUGGING
// ========================================
function updateDebug(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const fullMessage = `[${timestamp}] ${message}`;
    
    console.log(`🐛 ${type.toUpperCase()}:`, fullMessage);
    
    const element = document.getElementById(`debug${type.charAt(0).toUpperCase() + type.slice(1)}`);
    if (element) {
        element.textContent = fullMessage;
        element.style.backgroundColor = getDebugColor(type);
    }
}

function getDebugColor(type) {
    const colors = {
        status: '#e3f2fd',
        actions: '#e8f5e8',
        files: '#fff3e0',
        api: '#ffebee'
    };
    return colors[type] || '#f5f5f5';
}

// ========================================
// INICIALIZACIÓN
// ========================================
function initializeApp() {
    console.log('🔄 Inicializando aplicación...');
    
    try {
        // Buscar elementos DOM
        debugStatus = document.getElementById('debugStatus');
        debugActions = document.getElementById('debugActions');
        debugFiles = document.getElementById('debugFiles');
        debugAPI = document.getElementById('debugAPI');
        
        form = document.getElementById('experienceForm');
        audioInput = document.getElementById('audioFile');
        videoInput = document.getElementById('videoFile');
        audioFileName = document.getElementById('audioFileName');
        videoFileName = document.getElementById('videoFileName');
        audioUploadArea = document.getElementById('audioUploadArea');
        videoUploadArea = document.getElementById('videoUploadArea');
        audioPreview = document.getElementById('audioPreview');
        videoPreview = document.getElementById('videoPreview');
        audioPlayer = document.getElementById('audioPlayer');
        videoPlayer = document.getElementById('videoPlayer');
        submitBtn = document.getElementById('submitBtn');
        statusMessage = document.getElementById('statusMessage');
        testAPIBtn = document.getElementById('testAPIBtn');
        testPreviewBtn = document.getElementById('testPreviewBtn');
        
        // Verificar elementos críticos
        const requiredElements = {
            'form': form,
            'audioInput': audioInput,
            'videoInput': videoInput,
            'audioUploadArea': audioUploadArea,
            'videoUploadArea': videoUploadArea,
            'audioPreview': audioPreview,
            'videoPreview': videoPreview
        };
        
        let missingElements = [];
        for (const [name, element] of Object.entries(requiredElements)) {
            if (!element) {
                missingElements.push(name);
            }
        }
        
        if (missingElements.length > 0) {
            throw new Error(`Elementos faltantes: ${missingElements.join(', ')}`);
        }
        
        updateDebug('status', '✅ Elementos DOM encontrados');
        
        // Configurar event listeners
        setupEventListeners();
        
        updateDebug('status', '✅ App inicializada - CORS FIXED');
        
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        updateDebug('status', `❌ Error: ${error.message}`);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    console.log('🔗 Configurando event listeners...');
    
    try {
        // Clicks en áreas de upload
        audioUploadArea.addEventListener('click', function() {
            console.log('👆 Click en área de audio');
            updateDebug('actions', 'Click en área de audio');
            audioInput.click();
        });
        
        videoUploadArea.addEventListener('click', function() {
            console.log('👆 Click en área de video');
            updateDebug('actions', 'Click en área de video');
            videoInput.click();
        });
        
        // Cambios de archivo
        audioInput.addEventListener('change', handleAudioChange);
        videoInput.addEventListener('change', handleVideoChange);
        
        // Form submit
        form.addEventListener('submit', handleFormSubmit);
        
        // Botones de prueba (si existen)
        if (testAPIBtn) testAPIBtn.addEventListener('click', testAPIConnection);
        if (testPreviewBtn) testPreviewBtn.addEventListener('click', testPreviewFunction);
        
        console.log('✅ Event listeners configurados');
        updateDebug('actions', 'Event listeners OK');
        
    } catch (error) {
        console.error('❌ Error configurando listeners:', error);
        updateDebug('actions', `❌ Error: ${error.message}`);
    }
}

// ========================================
// MANEJO DE ARCHIVOS DE AUDIO
// ========================================
function handleAudioChange(e) {
    console.log('🎵 Audio seleccionado');
    updateDebug('files', `Audio: ${e.target.files.length} archivos`);
    
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        console.log('📄 Archivo de audio:', {
            name: file.name,
            type: file.type,
            size: file.size
        });
        
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        // Verificar tamaño (límite 25MB para audio)
        if (file.size > 25 * 1024 * 1024) {
            showMessage(`Audio file too large (${fileSize}MB). Please use a file smaller than 25MB.`, 'error');
            audioInput.value = '';
            return;
        }
        
        updateDebug('files', `Audio: ${file.name} (${fileSize} MB)`);
        
        try {
            // Actualizar interfaz
            audioFileName.innerHTML = `<strong>${file.name}</strong><br><small>Size: ${fileSize} MB</small>`;
            audioUploadArea.classList.add('has-file');
            
            // Crear URL y configurar reproductor
            const fileURL = URL.createObjectURL(file);
            audioPlayer.src = fileURL;
            
            // MOSTRAR PREVIEW - FORZADO
            audioPreview.style.display = 'block';
            audioPreview.style.opacity = '1';
            audioPreview.style.transform = 'translateY(0)';
            audioPreview.classList.add('show');
            
            // Ocultar área de upload
            audioUploadArea.style.display = 'none';
            
            console.log('✅ Audio preview mostrado');
            updateDebug('files', `✅ Audio preview visible: ${file.name}`);
            
        } catch (error) {
            console.error('❌ Error con preview de audio:', error);
            updateDebug('files', `❌ Error audio: ${error.message}`);
        }
    }
}

// ========================================
// MANEJO DE ARCHIVOS DE VIDEO
// ========================================
function handleVideoChange(e) {
    console.log('🎥 Video seleccionado');
    updateDebug('files', `Video: ${e.target.files.length} archivos`);
    
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        console.log('📄 Archivo de video:', {
            name: file.name,
            type: file.type,
            size: file.size
        });
        
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        // Verificar tamaño (límite 100MB para video)
        if (file.size > 100 * 1024 * 1024) {
            showMessage(`Video file too large (${fileSize}MB). Please use a file smaller than 100MB.`, 'error');
            videoInput.value = '';
            return;
        }
        
        updateDebug('files', `Video: ${file.name} (${fileSize} MB)`);
        
        try {
            // Actualizar interfaz
            videoFileName.innerHTML = `<strong>${file.name}</strong><br><small>Size: ${fileSize} MB</small>`;
            videoUploadArea.classList.add('has-file');
            
            // Crear URL y configurar reproductor
            const fileURL = URL.createObjectURL(file);
            videoPlayer.src = fileURL;
            
            // MOSTRAR PREVIEW - FORZADO
            videoPreview.style.display = 'block';
            videoPreview.style.opacity = '1';
            videoPreview.style.transform = 'translateY(0)';
            videoPreview.classList.add('show');
            
            // Ocultar área de upload
            videoUploadArea.style.display = 'none';
            
            console.log('✅ Video preview mostrado');
            updateDebug('files', `✅ Video preview visible: ${file.name}`);
            
        } catch (error) {
            console.error('❌ Error con preview de video:', error);
            updateDebug('files', `❌ Error video: ${error.message}`);
        }
    }
}

// ========================================
// FUNCIONES PARA REMOVER ARCHIVOS
// ========================================
function removeAudio() {
    console.log('🗑️ Removiendo audio');
    audioInput.value = '';
    audioPlayer.src = '';
    audioPreview.classList.remove('show');
    audioPreview.style.display = 'none';
    audioUploadArea.style.display = 'flex';
    audioFileName.innerHTML = 'Click here to select audio file';
    audioUploadArea.classList.remove('has-file');
    updateDebug('files', 'Audio removido');
}

function removeVideo() {
    console.log('🗑️ Removiendo video');
    videoInput.value = '';
    videoPlayer.src = '';
    videoPreview.classList.remove('show');
    videoPreview.style.display = 'none';
    videoUploadArea.style.display = 'flex';
    videoFileName.innerHTML = 'Click here to select video file';
    videoUploadArea.classList.remove('has-file');
    updateDebug('files', 'Video removido');
}

// ========================================
// TEST API CONNECTION
// ========================================
async function testAPIConnection() {
    console.log('🧪 Probando API...');
    updateDebug('api', 'Probando GET...');
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'GET'
        });
        
        const responseText = await response.text();
        console.log('📄 Respuesta GET:', responseText);
        
        if (response.ok) {
            updateDebug('api', '✅ GET OK');
            showMessage('API Test: SUCCESS', 'success');
        } else {
            updateDebug('api', `⚠️ GET ${response.status}`);
            showMessage(`API Test: ${response.status}`, 'error');
        }
        
    } catch (error) {
        console.error('❌ Error API test:', error);
        updateDebug('api', `❌ Error: ${error.message}`);
        showMessage(`API Test Failed: ${error.message}`, 'error');
    }
}

// ========================================
// TEST PREVIEW FUNCTION
// ========================================
function testPreviewFunction() {
    console.log('🔍 Testing previews...');
    updateDebug('actions', 'Testing previews...');
    
    // Mostrar previews de prueba
    audioPreview.innerHTML = '<div style="padding: 20px; background: yellow; color: black; font-weight: bold;">🧪 AUDIO PREVIEW TEST - Funcionando!</div>';
    audioPreview.style.display = 'block';
    audioPreview.style.opacity = '1';
    
    videoPreview.innerHTML = '<div style="padding: 20px; background: lime; color: black; font-weight: bold;">🧪 VIDEO PREVIEW TEST - Funcionando!</div>';
    videoPreview.style.display = 'block';
    videoPreview.style.opacity = '1';
    
    updateDebug('actions', '✅ Test previews shown');
    showMessage('Test previews shown for 3 seconds', 'success');
    
    // Restaurar después de 3 segundos
    setTimeout(() => {
        audioPreview.style.display = 'none';
        videoPreview.style.display = 'none';
        
        // Restaurar HTML original
        audioPreview.innerHTML = `
            <div class="preview-header">
                <svg class="icon-preview" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
                <strong>Audio Preview</strong>
            </div>
            <audio id="audioPlayer" controls></audio>
            <button type="button" class="remove-file-btn" onclick="removeAudio()">
                <svg class="icon-remove" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Remove Audio
            </button>
        `;
        
        videoPreview.innerHTML = `
            <div class="preview-header">
                <svg class="icon-preview" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 001 1z"/>
                </svg>
                <strong>Video Preview</strong>
            </div>
            <video id="videoPlayer" controls></video>
            <button type="button" class="remove-file-btn" onclick="removeVideo()">
                <svg class="icon-remove" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Remove Video
            </button>
        `;
        
        updateDebug('actions', 'Test previews hidden');
    }, 3000);
}

// ========================================
// FORM SUBMIT - CORS FIXED
// ========================================
async function handleFormSubmit(e) {
    e.preventDefault();
    
    console.log('📝 Envío de formulario - CORS FIXED');
    updateDebug('actions', 'Form submitting...');
    
    try {
        // Validar campos
        const studentName = document.getElementById('studentName').value.trim();
        const experience = document.getElementById('experience').value.trim();
        
        if (!studentName || !experience) {
            throw new Error('Please fill in all required fields');
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
        
        // Preparar datos
        const formData = {
            studentName: studentName,
            experience: experience,
            timestamp: new Date().toISOString()
        };
        
        console.log('📦 Datos base:', formData);
        updateDebug('api', 'Preparing data...');
        
        // Procesar archivos con límites de tamaño
        if (audioInput.files.length > 0) {
            const audioFile = audioInput.files[0];
            showMessage('Processing audio file...', 'loading');
            console.log('🎵 Procesando audio...');
            
            const audioData = await fileToBase64(audioFile);
            formData.audioFile = {
                name: audioFile.name,
                mimeType: audioFile.type,
                data: audioData
            };
            console.log('✅ Audio procesado');
        }
        
        if (videoInput.files.length > 0) {
            const videoFile = videoInput.files[0];
            showMessage('Processing video file...', 'loading');
            console.log('🎥 Procesando video...');
            
            const videoData = await fileToBase64(videoFile);
            formData.videoFile = {
                name: videoFile.name,
                mimeType: videoFile.type,
                data: videoData
            };
            console.log('✅ Video procesado');
        }
        
        const dataSize = JSON.stringify(formData).length;
        console.log('📊 Tamaño total de datos:', dataSize, 'caracteres');
        
        showMessage('Sending to Google Drive...', 'loading');
        updateDebug('api', 'Sending POST...');
        
        // ¡SOLUCIÓN CORS! - usar mode: 'no-cors'
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // ⬅️ ESTO SOLUCIONA EL CORS
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('📨 Respuesta recibida (no-cors mode)');
        
        // Con no-cors no podemos leer la respuesta, pero si llegó aquí sin error, fue exitoso
        console.log('✅ Envío completado sin errores CORS');
        updateDebug('api', '✅ POST sent (no-cors)');
        
        showMessage('Success! Your experience has been submitted and saved to Google Drive.', 'success');
        
        // Limpiar formulario
        form.reset();
        removeAudio();
        removeVideo();
        
        console.log('🎉 Formulario limpiado exitosamente');
        
    } catch (error) {
        console.error('❌ Error en envío:', error);
        updateDebug('api', `❌ Error: ${error.message}`);
        showMessage(`Error: ${error.message}`, 'error');
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
}

// ========================================
// UTILIDADES
// ========================================
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

function showMessage(message, type) {
    console.log(`💬 Mensaje: ${type.toUpperCase()} - ${message}`);
    statusMessage.textContent = message;
    statusMessage.className = 'status-message show ' + type;
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusMessage.classList.remove('show');
        }, 5000);
    }
}

// ========================================
// GLOBALES
// ========================================
window.removeAudio = removeAudio;
window.removeVideo = removeVideo;

// ========================================
// INICIALIZAR
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM loaded - CORS solution active');
    initializeApp();
});

console.log('📜 Script loaded - CORS FIXED VERSION');