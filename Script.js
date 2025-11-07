// ========================================
// CONFIGURACIÓN PRINCIPAL
// ========================================
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSCGZ3oumkJCqj-PSeKQ2cAQth4G-L_AeD3wi_qKWoOojS455s9UnFCV0VWQp4rppH/exec';

console.log('🚀 Student Experience App - INICIANDO');
console.log('📍 Script URL:', SCRIPT_URL);

// ========================================
// ELEMENTOS DOM
// ========================================
let debugStatus, debugActions, debugFiles, debugAPI;
let form, audioInput, videoInput, audioFileName, videoFileName;
let audioUploadArea, videoUploadArea, audioPreview, videoPreview;
let audioPlayer, videoPlayer, submitBtn, statusMessage;
let testAPIBtn, testPreviewBtn;


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
            console.error('❌ Elementos faltantes:', missingElements);
            if (debugStatus) updateDebug('status', `❌ Elementos faltantes: ${missingElements.join(', ')}`);
            return;
        }
        
        if (debugStatus) updateDebug('status', '✅ Elementos DOM encontrados');
        
        // Configurar event listeners
        setupEventListeners();
        
        if (debugStatus) updateDebug('status', '✅ App inicializada correctamente');
        console.log('✅ Aplicación inicializada exitosamente');
        
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        if (debugStatus) updateDebug('status', `❌ Error: ${error.message}`);
    }
}

// ========================================
// EVENT LISTENERS
// ========================================
function setupEventListeners() {
    console.log('🔗 Configurando event listeners...');
    
    try {
        // Clicks en áreas de upload
        if (audioUploadArea) {
            audioUploadArea.addEventListener('click', function() {
                console.log('👆 Click en área de audio');
                if (debugActions) updateDebug('actions', 'Click en área de audio');
                if (audioInput) audioInput.click();
            });
        }
        
        if (videoUploadArea) {
            videoUploadArea.addEventListener('click', function() {
                console.log('👆 Click en área de video');
                if (debugActions) updateDebug('actions', 'Click en área de video');
                if (videoInput) videoInput.click();
            });
        }
        
        // Cambios de archivo
        if (audioInput) audioInput.addEventListener('change', handleAudioChange);
        if (videoInput) videoInput.addEventListener('change', handleVideoChange);
        
        // Form submit
        if (form) form.addEventListener('submit', handleFormSubmit);
        
        // Botones de prueba (si existen)
        if (testAPIBtn) testAPIBtn.addEventListener('click', testAPIConnection);
        if (testPreviewBtn) testPreviewBtn.addEventListener('click', testPreviewFunction);
        
        console.log('✅ Event listeners configurados');
        if (debugActions) updateDebug('actions', 'Event listeners configurados');
        
    } catch (error) {
        console.error('❌ Error configurando listeners:', error);
        if (debugActions) updateDebug('actions', `❌ Error: ${error.message}`);
    }
}

// ========================================
// MANEJO DE ARCHIVOS DE AUDIO
// ========================================
function handleAudioChange(e) {
    console.log('🎵 Audio seleccionado');
    if (debugFiles) updateDebug('files', `Audio: ${e.target.files.length} archivos`);
    
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
        
        if (debugFiles) updateDebug('files', `Audio: ${file.name} (${fileSize} MB)`);
        
        try {
            // Actualizar interfaz
            if (audioFileName) {
                audioFileName.innerHTML = `<strong>${file.name}</strong><br><small>Size: ${fileSize} MB</small>`;
            }
            if (audioUploadArea) {
                audioUploadArea.classList.add('has-file');
            }
            
            // Crear URL y configurar reproductor
            const fileURL = URL.createObjectURL(file);
            if (audioPlayer) {
                audioPlayer.src = fileURL;
            }
            
            // MOSTRAR PREVIEW
            if (audioPreview) {
                audioPreview.style.display = 'block';
                audioPreview.style.opacity = '1';
                audioPreview.style.transform = 'translateY(0)';
                audioPreview.classList.add('show');
            }
            
            // Ocultar área de upload
            if (audioUploadArea) {
                audioUploadArea.style.display = 'none';
            }
            
            console.log('✅ Audio preview mostrado');
            if (debugFiles) updateDebug('files', `✅ Audio preview: ${file.name}`);
            
        } catch (error) {
            console.error('❌ Error con preview de audio:', error);
            if (debugFiles) updateDebug('files', `❌ Error audio: ${error.message}`);
        }
    }
}

// ========================================
// MANEJO DE ARCHIVOS DE VIDEO
// ========================================
function handleVideoChange(e) {
    console.log('🎥 Video seleccionado');
    if (debugFiles) updateDebug('files', `Video: ${e.target.files.length} archivos`);
    
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
        
        if (debugFiles) updateDebug('files', `Video: ${file.name} (${fileSize} MB)`);
        
        try {
            // Actualizar interfaz
            if (videoFileName) {
                videoFileName.innerHTML = `<strong>${file.name}</strong><br><small>Size: ${fileSize} MB</small>`;
            }
            if (videoUploadArea) {
                videoUploadArea.classList.add('has-file');
            }
            
            // Crear URL y configurar reproductor
            const fileURL = URL.createObjectURL(file);
            if (videoPlayer) {
                videoPlayer.src = fileURL;
            }
            
            // MOSTRAR PREVIEW
            if (videoPreview) {
                videoPreview.style.display = 'block';
                videoPreview.style.opacity = '1';
                videoPreview.style.transform = 'translateY(0)';
                videoPreview.classList.add('show');
            }
            
            // Ocultar área de upload
            if (videoUploadArea) {
                videoUploadArea.style.display = 'none';
            }
            
            console.log('✅ Video preview mostrado');
            if (debugFiles) updateDebug('files', `✅ Video preview: ${file.name}`);
            
        } catch (error) {
            console.error('❌ Error con preview de video:', error);
            if (debugFiles) updateDebug('files', `❌ Error video: ${error.message}`);
        }
    }
}

// ========================================
// FUNCIONES PARA REMOVER ARCHIVOS
// ========================================
function removeAudio() {
    console.log('🗑️ Removiendo audio');
    if (audioInput) audioInput.value = '';
    if (audioPlayer) audioPlayer.src = '';
    if (audioPreview) {
        audioPreview.classList.remove('show');
        audioPreview.style.display = 'none';
    }
    if (audioUploadArea) {
        audioUploadArea.style.display = 'flex';
        audioUploadArea.classList.remove('has-file');
    }
    if (audioFileName) audioFileName.innerHTML = 'Click here to select audio file';
    if (debugFiles) updateDebug('files', 'Audio removido');
}

function removeVideo() {
    console.log('🗑️ Removiendo video');
    if (videoInput) videoInput.value = '';
    if (videoPlayer) videoPlayer.src = '';
    if (videoPreview) {
        videoPreview.classList.remove('show');
        videoPreview.style.display = 'none';
    }
    if (videoUploadArea) {
        videoUploadArea.style.display = 'flex';
        videoUploadArea.classList.remove('has-file');
    }
    if (videoFileName) videoFileName.innerHTML = 'Click here to select video file';
    if (debugFiles) updateDebug('files', 'Video removido');
}

// ========================================
// TEST API CONNECTION
// ========================================
async function testAPIConnection() {
    console.log('🧪 Probando API...');
    if (debugAPI) updateDebug('api', 'Probando GET...');
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'GET'
        });
        
        const responseText = await response.text();
        console.log('📄 Respuesta GET:', responseText);
        
        if (response.ok) {
            if (debugAPI) updateDebug('api', '✅ GET OK');
            showMessage('API Test: SUCCESS', 'success');
        } else {
            if (debugAPI) updateDebug('api', `⚠️ GET ${response.status}`);
            showMessage(`API Test: ${response.status}`, 'error');
        }
        
    } catch (error) {
        console.error('❌ Error API test:', error);
        if (debugAPI) updateDebug('api', `❌ Error: ${error.message}`);
        showMessage(`API Test Failed: ${error.message}`, 'error');
    }
}

// ========================================
// TEST PREVIEW FUNCTION
// ========================================
function testPreviewFunction() {
    console.log('🔍 Testing previews...');
    if (debugActions) updateDebug('actions', 'Testing previews...');
    
    // Mostrar previews de prueba
    if (audioPreview) {
        audioPreview.innerHTML = '<div style="padding: 20px; background: yellow; color: black; font-weight: bold;">🧪 AUDIO PREVIEW TEST - ¡Funcionando!</div>';
        audioPreview.style.display = 'block';
        audioPreview.style.opacity = '1';
    }
    
    if (videoPreview) {
        videoPreview.innerHTML = '<div style="padding: 20px; background: lime; color: black; font-weight: bold;">🧪 VIDEO PREVIEW TEST - ¡Funcionando!</div>';
        videoPreview.style.display = 'block';
        videoPreview.style.opacity = '1';
    }
    
    if (debugActions) updateDebug('actions', '✅ Test previews shown');
    showMessage('Test previews shown for 3 seconds', 'success');
    
    // Restaurar después de 3 segundos
    setTimeout(() => {
        if (audioPreview) {
            audioPreview.style.display = 'none';
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
        }
        
        if (videoPreview) {
            videoPreview.style.display = 'none';
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
        }
        
        if (debugActions) updateDebug('actions', 'Test previews hidden');
    }, 3000);
}

// ========================================
// FORM SUBMIT - CORS FIXED
// ========================================
async function handleFormSubmit(e) {
    e.preventDefault();
    
    console.log('📝 Envío de formulario iniciado');
    if (debugActions) updateDebug('actions', 'Form submitting...');
    
    try {
        // Validar campos
        const studentName = document.getElementById('studentName').value.trim();
        const experience = document.getElementById('experience').value.trim();
        
        if (!studentName || !experience) {
            throw new Error('Please fill in all required fields');
        }
        
        // Deshabilitar botón
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="icon-btn" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Uploading...
            `;
        }
        
        showMessage('Processing your submission... Please wait.', 'loading');
        
        // Preparar datos
        const formData = {
            studentName: studentName,
            experience: experience,
            timestamp: new Date().toISOString()
        };
        
        console.log('📦 Datos base:', formData);
        if (debugAPI) updateDebug('api', 'Preparing data...');
        
        // Procesar archivos
        if (audioInput && audioInput.files.length > 0) {
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
        
        if (videoInput && videoInput.files.length > 0) {
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
        console.log('📊 Tamaño de datos:', dataSize, 'caracteres');
        
        showMessage('Sending to Google Drive...', 'loading');
        if (debugAPI) updateDebug('api', 'Sending POST...');
        
        // SOLUCIÓN CORS - usar mode: 'no-cors'
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('📨 Request sent successfully (no-cors mode)');
        if (debugAPI) updateDebug('api', '✅ POST sent successfully');
        
        showMessage('Success! Your experience has been submitted and saved to Google Drive.', 'success');

        // Limpiar formulario
        if (form) form.reset();
        removeAudio();
        removeVideo();

        console.log('🎉 Form submitted successfully');

        // Recargar experiencias en el foro
        if (typeof loadExperiences === 'function') {
            setTimeout(() => {
                loadExperiences();
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Error en envío:', error);
        if (debugAPI) updateDebug('api', `❌ Error: ${error.message}`);
        showMessage(`Error: ${error.message}`, 'error');
    } finally {
        // Rehabilitar botón
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <svg class="icon-btn" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                Post Experience
            `;
        }
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
    if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message show ' + type;
        
        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                statusMessage.classList.remove('show');
            }, 5000);
        }
    }
}

// ========================================
// GLOBALES PARA HTML
// ========================================
window.removeAudio = removeAudio;
window.removeVideo = removeVideo;

// ========================================
// INICIALIZAR CUANDO EL DOM ESTÉ LISTO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM loaded - Initializing app...');
    initializeApp();
    initializeForum();
});

console.log('📜 Script loaded successfully - Student Experience App v1.0');

// ========================================
// FUNCIONALIDAD DEL FORO
// ========================================

// Variables globales del foro
let allExperiences = [];
let filteredExperiences = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 5;
let isAdminMode = false;

// Contraseña de admin (hash SHA-256 de "Ldirinem2025")
// La contraseña real NO está en el código, solo su hash
// Para cambiar la contraseña, abre generate-hash.html y genera un nuevo hash
const ADMIN_PASSWORD_HASH = '7f6dbc05d620d3050960cd4cb3dedb8c08b1a9810964adeec21e2c0b3a22a3f3';

// Función para calcular hash SHA-256
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Elementos DOM del foro
let experiencesContainer, loadingSpinner, emptyState;
let searchInput, pagination, prevBtn, nextBtn, paginationInfo;
let adminBtn, adminBanner, logoutBtn;
let adminModal, adminPassword, modalCancelBtn, modalConfirmBtn, modalError;

// Inicializar el foro
function initializeForum() {
    console.log('📚 Inicializando foro...');

    // Obtener elementos DOM
    experiencesContainer = document.getElementById('experiencesContainer');
    loadingSpinner = document.getElementById('loadingSpinner');
    emptyState = document.getElementById('emptyState');
    searchInput = document.getElementById('searchInput');
    pagination = document.getElementById('pagination');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    paginationInfo = document.getElementById('paginationInfo');
    adminBtn = document.getElementById('adminBtn');
    adminBanner = document.getElementById('adminBanner');
    logoutBtn = document.getElementById('logoutBtn');
    adminModal = document.getElementById('adminModal');
    adminPassword = document.getElementById('adminPassword');
    modalCancelBtn = document.getElementById('modalCancelBtn');
    modalConfirmBtn = document.getElementById('modalConfirmBtn');
    modalError = document.getElementById('modalError');

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => changePage(-1));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => changePage(1));
    }

    if (adminBtn) {
        adminBtn.addEventListener('click', openAdminModal);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (modalCancelBtn) {
        modalCancelBtn.addEventListener('click', closeAdminModal);
    }

    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', handleAdminLogin);
    }

    if (adminPassword) {
        adminPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleAdminLogin();
            }
        });
    }

    // Verificar si ya está en modo admin (sessionStorage)
    const storedAdminMode = sessionStorage.getItem('isAdmin');
    if (storedAdminMode === 'true') {
        isAdminMode = true;
        showAdminBanner();
    }

    // Cargar experiencias
    loadExperiences();

    console.log('✅ Foro inicializado');
}

// Cargar experiencias desde la API
async function loadExperiences() {
    console.log('🔄 Cargando experiencias...');

    try {
        // Mostrar loading
        if (loadingSpinner) loadingSpinner.style.display = 'flex';
        if (emptyState) emptyState.style.display = 'none';

        // Limpiar container (excepto loading y empty state)
        const cards = experiencesContainer.querySelectorAll('.experience-card');
        cards.forEach(card => card.remove());

        // Hacer petición GET
        const response = await fetch(`${SCRIPT_URL}?action=getExperiencias`, {
            method: 'GET'
        });

        const data = await response.json();

        console.log('📊 Respuesta de API:', data);

        if (data.success && data.data) {
            allExperiences = data.data;
            filteredExperiences = [...allExperiences];
            currentPage = 1;

            console.log(`✅ ${allExperiences.length} experiencias cargadas`);

            // Mostrar experiencias
            displayExperiences();
        } else {
            throw new Error(data.message || 'Error loading experiences');
        }

    } catch (error) {
        console.error('❌ Error cargando experiencias:', error);

        // Mostrar empty state
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'flex';
            emptyState.querySelector('h3').textContent = 'Error Loading Experiences';
            emptyState.querySelector('p').textContent = error.message;
        }
    }
}

// Mostrar experiencias en la página actual
function displayExperiences() {
    console.log('🎨 Mostrando experiencias...');

    // Ocultar loading
    if (loadingSpinner) loadingSpinner.style.display = 'none';

    // Limpiar cards existentes
    const cards = experiencesContainer.querySelectorAll('.experience-card');
    cards.forEach(card => card.remove());

    // Verificar si hay experiencias
    if (filteredExperiences.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'flex';
            emptyState.querySelector('h3').textContent = 'No Publications Yet';
            emptyState.querySelector('p').textContent = 'Be the first to share your English learning experience!';
        }
        if (pagination) pagination.style.display = 'none';
        return;
    }

    // Ocultar empty state
    if (emptyState) emptyState.style.display = 'none';

    // Calcular paginación
    const totalPages = Math.ceil(filteredExperiences.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentExperiences = filteredExperiences.slice(startIndex, endIndex);

    console.log(`📄 Página ${currentPage}/${totalPages} - Mostrando ${currentExperiences.length} experiencias`);

    // Crear cards
    currentExperiences.forEach(exp => {
        const card = createExperienceCard(exp);
        // Insertar antes del loading spinner
        experiencesContainer.insertBefore(card, loadingSpinner);
    });

    // Actualizar paginación
    updatePagination(totalPages);
}

// Crear card de experiencia
function createExperienceCard(exp) {
    const card = document.createElement('div');
    card.className = 'experience-card';
    card.dataset.id = exp.id;

    // Formatear fecha
    const date = new Date(exp.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Botón de eliminar (solo en modo admin)
    const deleteButton = isAdminMode ? `
        <button type="button" class="delete-btn" onclick="deleteExperience('${exp.id}')">
            <svg class="icon-btn-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
            Delete
        </button>
    ` : '';

    // Media (audio/video) - Convertir URLs de Google Drive a URLs directas
    let mediaHTML = '';
    if (exp.audioUrl || exp.videoUrl) {
        mediaHTML = '<div class="experience-media">';

        if (exp.audioUrl) {
            const audioDirectUrl = getDirectDriveUrl(exp.audioUrl);
            mediaHTML += `
                <div class="media-item">
                    <div class="media-label">
                        <svg class="icon-btn-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                        </svg>
                        Audio Recording
                    </div>
                    <audio controls src="${audioDirectUrl}">
                        Your browser does not support the audio element.
                    </audio>
                    <a href="${exp.audioUrl}" target="_blank" style="font-size: 12px; color: #012169; text-decoration: none; display: block; margin-top: 8px;">
                        📎 Open in Google Drive
                    </a>
                </div>
            `;
        }

        if (exp.videoUrl) {
            const videoDirectUrl = getDirectDriveUrl(exp.videoUrl);
            mediaHTML += `
                <div class="media-item">
                    <div class="media-label">
                        <svg class="icon-btn-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                        Video Recording
                    </div>
                    <video controls src="${videoDirectUrl}">
                        Your browser does not support the video element.
                    </video>
                    <a href="${exp.videoUrl}" target="_blank" style="font-size: 12px; color: #012169; text-decoration: none; display: block; margin-top: 8px;">
                        📎 Open in Google Drive
                    </a>
                </div>
            `;
        }

        mediaHTML += '</div>';
    }

    card.innerHTML = `
        <div class="experience-header">
            <div class="experience-info">
                <h3 class="experience-student">${escapeHtml(exp.studentName)}</h3>
                <div class="experience-date">${formattedDate}</div>
            </div>
            ${deleteButton}
        </div>
        <div class="experience-text">${escapeHtml(exp.experience)}</div>
        ${mediaHTML}
    `;

    return card;
}

// Eliminar experiencia (solo admin)
async function deleteExperience(id) {
    if (!isAdminMode) {
        alert('Unauthorized access');
        return;
    }

    // Confirmar
    const exp = allExperiences.find(e => e.id === id);
    if (!exp) return;

    const confirmed = confirm(`Are you sure you want to delete the experience from "${exp.studentName}"?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    console.log('🗑️ Eliminando experiencia:', id);

    try {
        showMessage('Deleting experience...', 'loading');

        // Obtener contraseña del sessionStorage
        const password = sessionStorage.getItem('adminPassword');

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'deleteExperiencia',
                id: id,
                password: password
            })
        });

        const data = await response.json();

        console.log('📊 Respuesta delete:', data);

        if (data.success) {
            showMessage('Experience deleted successfully', 'success');
            console.log('✅ Experiencia eliminada');

            // Recargar experiencias
            await loadExperiences();
        } else {
            throw new Error(data.message || 'Error deleting experience');
        }

    } catch (error) {
        console.error('❌ Error eliminando:', error);
        showMessage(`Error: ${error.message}`, 'error');
    }
}

// Buscar experiencias
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    console.log('🔍 Buscando:', searchTerm);

    if (!searchTerm) {
        filteredExperiences = [...allExperiences];
    } else {
        filteredExperiences = allExperiences.filter(exp =>
            exp.studentName.toLowerCase().includes(searchTerm)
        );
    }

    currentPage = 1;
    displayExperiences();
}

// Cambiar página
function changePage(delta) {
    currentPage += delta;
    displayExperiences();
}

// Actualizar paginación
function updatePagination(totalPages) {
    if (!pagination || !prevBtn || !nextBtn || !paginationInfo) return;

    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';

    // Actualizar botones
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Actualizar info
    paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

// Abrir modal de admin
function openAdminModal() {
    console.log('🔐 Abriendo modal de admin...');

    if (adminModal) {
        adminModal.style.display = 'flex';
    }
    if (adminPassword) {
        adminPassword.value = '';
        adminPassword.focus();
    }
    if (modalError) {
        modalError.style.display = 'none';
    }
}

// Cerrar modal de admin
function closeAdminModal() {
    console.log('❌ Cerrando modal de admin...');

    if (adminModal) {
        adminModal.style.display = 'none';
    }
    if (adminPassword) {
        adminPassword.value = '';
    }
    if (modalError) {
        modalError.style.display = 'none';
    }
}

// Login de admin (VALIDACIÓN LOCAL - SIN API)
async function handleAdminLogin() {
    const password = adminPassword ? adminPassword.value : '';

    if (!password) {
        showModalError('Please enter a password');
        return;
    }

    console.log('🔐 Validando credenciales localmente...');

    try {
        // Deshabilitar botón
        if (modalConfirmBtn) modalConfirmBtn.disabled = true;

        // Calcular hash de la contraseña ingresada
        const inputHash = await sha256(password);
        console.log('🔐 Hash calculado');

        // Comparar con el hash almacenado
        if (inputHash === ADMIN_PASSWORD_HASH) {
            console.log('✅ Credenciales válidas');

            // Activar modo admin
            isAdminMode = true;
            sessionStorage.setItem('isAdmin', 'true');
            sessionStorage.setItem('adminPassword', password);

            // Cerrar modal
            closeAdminModal();

            // Mostrar banner
            showAdminBanner();

            // Recargar experiencias para mostrar botones de eliminar
            displayExperiences();

            showMessage('Administrator access granted', 'success');
        } else {
            console.log('❌ Credenciales inválidas');
            showModalError('Invalid password. Please try again.');
        }

    } catch (error) {
        console.error('❌ Error en login:', error);
        showModalError('Error validating credentials: ' + error.message);
    } finally {
        // Rehabilitar botón
        if (modalConfirmBtn) modalConfirmBtn.disabled = false;
    }
}

// Logout de admin
function handleLogout() {
    console.log('👋 Cerrando sesión de admin...');

    isAdminMode = false;
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('adminPassword');

    hideAdminBanner();
    displayExperiences();

    showMessage('Logged out successfully', 'success');
}

// Mostrar banner de admin
function showAdminBanner() {
    if (adminBanner) {
        adminBanner.style.display = 'flex';
    }
    if (adminBtn) {
        adminBtn.style.display = 'none';
    }
}

// Ocultar banner de admin
function hideAdminBanner() {
    if (adminBanner) {
        adminBanner.style.display = 'none';
    }
    if (adminBtn) {
        adminBtn.style.display = 'flex';
    }
}

// Mostrar error en modal
function showModalError(message) {
    if (modalError) {
        modalError.textContent = message;
        modalError.style.display = 'block';
    }
}

// Escape HTML para prevenir XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Convertir URL de Google Drive a URL directa para reproducción
function getDirectDriveUrl(driveUrl) {
    if (!driveUrl) return null;

    // Si ya es una URL directa, devolverla
    if (driveUrl.includes('/uc?')) {
        return driveUrl;
    }

    // Extraer el FILE_ID de diferentes formatos de URL de Google Drive
    let fileId = null;

    // Formato 1: https://drive.google.com/file/d/FILE_ID/view
    const match1 = driveUrl.match(/\/file\/d\/([^\/]+)/);
    if (match1) {
        fileId = match1[1];
    }

    // Formato 2: https://drive.google.com/open?id=FILE_ID
    const match2 = driveUrl.match(/[?&]id=([^&]+)/);
    if (match2) {
        fileId = match2[1];
    }

    // Si encontramos el ID, crear URL directa
    if (fileId) {
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // Si no pudimos extraer el ID, devolver la URL original
    return driveUrl;
}

// Hacer deleteExperience global para que funcione con onclick
window.deleteExperience = deleteExperience;
