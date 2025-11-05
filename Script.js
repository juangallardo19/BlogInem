// ========================================
// CONFIGURACIÓN - ACTUALIZA ESTA URL
// ========================================
const SCRIPT_URL = 'TU_NUEVA_URL_AQUI'; // ⬅️ CAMBIA ESTO

console.log('🚀 INICIANDO APLICACIÓN v2');
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
// FUNCIÓN DE DEBUGGING MEJORADA
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
    
    // Verificar URL
    if (SCRIPT_URL === 'TU_NUEVA_URL_AQUI') {
        console.error('❌ ERROR: Debes actualizar SCRIPT_URL');
        updateDebug('status', '❌ ERROR: URL del script no configurada');
        return;
    }
    
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
            'videoPreview': videoPreview,
            'testAPIBtn': testAPIBtn,
            'testPreviewBtn': testPreviewBtn
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
        
        updateDebug('status', '✅ Todos los elementos DOM encontrados');
        
        // Configurar event listeners
        setupEventListeners();
        
        updateDebug('status', '✅ Aplicación inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        updateDebug('status', `❌ Error: ${error.message}`);
    }
}

// ========================================
// CONFIGURAR EVENT LISTENERS
// ========================================
function setupEventListeners() {
    console.log('🔗 Configurando event listeners...');
    
    try {
        // Eventos de click para áreas de upload
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
        
        // Eventos de cambio de archivo
        audioInput.addEventListener('change', handleAudioChange);
        videoInput.addEventListener('change', handleVideoChange);
        
        // Eventos de formulario
        form.addEventListener('submit', handleFormSubmit);
        
        // Botones de prueba
        testAPIBtn.addEventListener('click', testAPIConnection);
        testPreviewBtn.addEventListener('click', testPreviewFunction);
        
        console.log('✅ Event listeners configurados');
        updateDebug('actions', 'Event listeners configurados');
        
    } catch (error) {
        console.error('❌ Error configurando event listeners:', error);
        updateDebug('actions', `❌ Error: ${error.message}`);
    }
}

// ========================================
// TEST API CONNECTION - MEJORADO
// ========================================
async function testAPIConnection() {
    console.log('🧪 Probando conexión con API...');
    updateDebug('api', 'Probando conexión...');
    
    try {
        console.log('📡 Enviando petición GET a:', SCRIPT_URL);
        
        const response = await fetch(SCRIPT_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📨 Respuesta recibida:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            redirected: response.redirected,
            type: response.type
        });
        
        const responseText = await response.text();
        console.log('📄 Contenido de respuesta (primeros 500 chars):', responseText.substring(0, 500));
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
            console.log('📊 Datos parseados:', responseData);
            
            if (responseData.success) {
                updateDebug('api', `✅ API OK: ${responseData.message}`);
                showMessage(`API Test SUCCESS: ${responseData.message}`, 'success');
            } else {
                updateDebug('api', `⚠️ API Warning: ${responseData.message}`);
                showMessage(`API Test Warning: ${responseData.message}`, 'error');
            }
        } catch (parseError) {
            console.log('⚠️ Respuesta no es JSON:', parseError);
            updateDebug('api', `⚠️ Respuesta no JSON: ${response.status}`);
            showMessage(`API responded but not JSON. Status: ${response.status}`, 'error');
        }
        
    } catch (error) {
        console.error('❌ Error probando API:', error);
        updateDebug('api', `❌ Error: ${error.message}`);
        showMessage(`API Test FAILED: ${error.message}`, 'error');
    }
}

// ========================================
// TEST POST REQUEST - NUEVA FUNCIÓN
// ========================================
async function testPOSTRequest() {
    console.log('🧪 Probando petición POST...');
    updateDebug('api', 'Probando POST...');
    
    try {
        const testData = {
            studentName: 'Test Student',
            experience: 'This is a test experience',
            timestamp: new Date().toISOString()
        };
        
        console.log('📦 Datos de prueba:', testData);
        console.log('📡 Enviando petición POST a:', SCRIPT_URL);
        
        const requestBody = JSON.stringify(testData);
        console.log('📄 Body de petición:', requestBody);
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody
        });
        
        console.log('📨 Respuesta POST recibida:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            headers: Object.fromEntries(response.headers.entries())
        });
        
        const responseText = await response.text();
        console.log('📄 Contenido respuesta POST:', responseText);
        
        let responseData;
        try {
            responseData = JSON.parse(responseText);
            console.log('📊 Datos POST parseados:', responseData);
            
            if (responseData.success) {
                updateDebug('api', `✅ POST OK: ${responseData.message}`);
                showMessage(`POST Test SUCCESS: ${responseData.message}`, 'success');
            } else {
                updateDebug('api', `❌ POST Error: ${responseData.message}`);
                showMessage(`POST Test FAILED: ${responseData.message}`, 'error');
            }
        } catch (parseError) {
            console.log('⚠️ Respuesta POST no es JSON:', parseError);
            updateDebug('api', `⚠️ POST respuesta no JSON`);
            showMessage(`POST responded but not JSON. Status: ${response.status}`, 'error');
        }
        
    } catch (error) {
        console.error('❌ Error en prueba POST:', error);
        updateDebug('api', `❌ POST Error: ${error.message}`);
        showMessage(`POST Test FAILED: ${error.message}`, 'error');
    }
}

// ========================================
// MANEJO DE ARCHIVOS - SIMPLIFICADO PARA DEBUG
// ========================================
function handleAudioChange(e) {
    console.log('🎵 Audio file selected');
    updateDebug('files', `Audio: ${e.target.files.length} files`);
    
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        console.log('📄 Audio file details:', {
            name: file.name,
            type: file.type,
            size: file.size
        });
        
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        updateDebug('files', `Audio: ${file.name} (${fileSize} MB)`);
        
        // Mostrar preview
        try {
            audioFileName.innerHTML = `<strong>${file.name}</strong><br><small>Size: ${fileSize} MB</small>`;
            audioUploadArea.classList.add('has-file');
            
            const fileURL = URL.createObjectURL(file);
            audioPlayer.src = fileURL;
            
            // FORZAR visibilidad del preview
            audioPreview.style.display = 'block';
            audioPreview.style.opacity = '1';
            audioPreview.style.transform = 'translateY(0)';
            audioPreview.classList.add('show');
            
            audioUploadArea.style.display = 'none';
            
            console.log('✅ Audio preview mostrado');
            updateDebug('files', `✅ Audio preview visible`);
            
        } catch (error) {
            console.error('❌ Error mostrando preview audio:', error);
            updateDebug('files', `❌ Error: ${error.message}`);
        }
    }
}

function handleVideoChange(e) {
    console.log('🎥 Video file selected');
    updateDebug('files', `Video: ${e.target.files.length} files`);
    
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        console.log('📄 Video file details:', {
            name: file.name,
            type: file.type,
            size: file.size
        });
        
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        updateDebug('files', `Video: ${file.name} (${fileSize} MB)`);
        
        // Mostrar preview
        try {
            videoFileName.innerHTML = `<strong>${file.name}</strong><br><small>Size: ${fileSize} MB</small>`;
            videoUploadArea.classList.add('has-file');
            
            const fileURL = URL.createObjectURL(file);
            videoPlayer.src = fileURL;
            
            // FORZAR visibilidad del preview
            videoPreview.style.display = 'block';
            videoPreview.style.opacity = '1';
            videoPreview.style.transform = 'translateY(0)';
            videoPreview.classList.add('show');
            
            videoUploadArea.style.display = 'none';
            
            console.log('✅ Video preview mostrado');
            updateDebug('files', `✅ Video preview visible`);
            
        } catch (error) {
            console.error('❌ Error mostrando preview video:', error);
            updateDebug('files', `❌ Error: ${error.message}`);
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
// TEST PREVIEW FUNCTION
// ========================================
function testPreviewFunction() {
    console.log('🔍 Testing preview function...');
    updateDebug('actions', 'Testing preview...');
    
    // Mostrar preview de audio temporalmente
    audioPreview.innerHTML = '<div style="padding: 20px; background: yellow; color: black; font-weight: bold;">🧪 TEST AUDIO PREVIEW - Si ves esto, el CSS funciona</div>';
    audioPreview.style.display = 'block';
    audioPreview.style.opacity = '1';
    
    // Mostrar preview de video temporalmente
    videoPreview.innerHTML = '<div style="padding: 20px; background: lime; color: black; font-weight: bold;">🧪 TEST VIDEO PREVIEW - Si ves esto, el CSS funciona</div>';
    videoPreview.style.display = 'block';
    videoPreview.style.opacity = '1';
    
    updateDebug('actions', '✅ Test previews shown');
    showMessage('Test previews shown for 3 seconds', 'success');
    
    setTimeout(() => {
        audioPreview.style.display = 'none';
        videoPreview.style.display = 'none';
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
// FORM SUBMIT - SIMPLIFICADO PARA DEBUG
// ========================================
async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('📝 Form submit started');
    updateDebug('actions', 'Form submitting...');
    
    // Para debug, usar la función de test POST
    await testPOSTRequest();
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
    console.log(`💬 Message: ${type.toUpperCase()} - ${message}`);
    statusMessage.textContent = message;
    statusMessage.className = 'status-message show ' + type;
    
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusMessage.classList.remove('show');
        }, 5000);
    }
}

// ========================================
// HACER FUNCIONES GLOBALES
// ========================================
window.removeAudio = removeAudio;
window.removeVideo = removeVideo;
window.testPOSTRequest = testPOSTRequest;

// ========================================
// INICIALIZAR
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM loaded');
    initializeApp();
});

console.log('📜 Script loaded');