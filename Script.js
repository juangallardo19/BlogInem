// ========================================
// FRONTEND ARREGLADO PARA MEDIOS
// ========================================

const API_URL = 'https://script.google.com/macros/s/AKfycbwiVEWq6dybGTUZAVc1G_vCWd-1i3ySzWZjLWbDLC4l6lYj58vmlFSrFj8GMfRvlXMq/exec';
const MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30MB

let isAdminMode = false;
let allPublications = [];
let filteredPublications = [];
let currentPage = 1;
const publicationsPerPage = 5;

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando Student Experience Portal v2.0 - Media Fixed');
    setupEventListeners();
    loadPublications();
    
    const savedAdmin = localStorage.getItem('adminMode');
    if (savedAdmin === 'true') {
        enableAdminMode();
    }
});

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    const form = document.getElementById('experienceForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    setupFileHandlers();
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', showAdminModal);
    }
    
    setupModalHandlers();
    setupPaginationHandlers();
}

function setupFileHandlers() {
    const audioInput = document.getElementById('audioFile');
    const audioArea = document.getElementById('audioUploadArea');
    
    if (audioInput && audioArea) {
        audioInput.addEventListener('change', (e) => handleFileSelect(e, 'audio'));
        audioArea.addEventListener('click', () => audioInput.click());
        audioArea.addEventListener('dragover', handleDragOver);
        audioArea.addEventListener('drop', (e) => handleFileDrop(e, 'audio'));
    }
    
    const videoInput = document.getElementById('videoFile');
    const videoArea = document.getElementById('videoUploadArea');
    
    if (videoInput && videoArea) {
        videoInput.addEventListener('change', (e) => handleFileSelect(e, 'video'));
        videoArea.addEventListener('click', () => videoInput.click());
        videoArea.addEventListener('dragover', handleDragOver);
        videoArea.addEventListener('drop', (e) => handleFileDrop(e, 'video'));
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

function handleFileDrop(event, type) {
    event.preventDefault();
    event.stopPropagation();
    
    const area = event.currentTarget;
    area.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const input = type === 'audio' ? 
            document.getElementById('audioFile') : 
            document.getElementById('videoFile');
        
        if (input) {
            input.files = files;
            handleFileSelect({ target: input }, type);
        }
    }
}

function handleFileSelect(event, type) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log(`📁 Archivo seleccionado (${type}):`, {
        name: file.name,
        size: file.size,
        type: file.type
    });
    
    const maxSize = type === 'audio' ? MAX_AUDIO_SIZE : MAX_VIDEO_SIZE;
    
    if (file.size > maxSize) {
        showMessage(`Archivo muy grande. Máximo: ${formatFileSize(maxSize)}`, 'error');
        event.target.value = '';
        return;
    }
    
    if (type === 'audio') {
        handleAudioFile(file);
    } else {
        handleVideoFile(file);
    }
}

function handleAudioFile(file) {
    const fileName = document.getElementById('audioFileName');
    const preview = document.getElementById('audioPreview');
    const player = document.getElementById('audioPlayer');
    
    if (fileName) fileName.textContent = `${file.name} (${formatFileSize(file.size)})`;
    
    if (preview && player) {
        const url = URL.createObjectURL(file);
        player.src = url;
        preview.style.display = 'block';
        console.log('🎵 Audio preview configurado');
    }
}

function handleVideoFile(file) {
    const fileName = document.getElementById('videoFileName');
    const preview = document.getElementById('videoPreview');
    const player = document.getElementById('videoPlayer');
    
    if (fileName) fileName.textContent = `${file.name} (${formatFileSize(file.size)})`;
    
    if (preview && player) {
        const url = URL.createObjectURL(file);
        player.src = url;
        preview.style.display = 'block';
        console.log('🎥 Video preview configurado');
    }
}

function removeAudio() {
    const input = document.getElementById('audioFile');
    const preview = document.getElementById('audioPreview');
    const fileName = document.getElementById('audioFileName');
    const player = document.getElementById('audioPlayer');
    
    if (input) input.value = '';
    if (preview) preview.style.display = 'none';
    if (fileName) fileName.textContent = 'Click here to select audio file';
    if (player) {
        player.pause();
        URL.revokeObjectURL(player.src);
        player.src = '';
    }
}

function removeVideo() {
    const input = document.getElementById('videoFile');
    const preview = document.getElementById('videoPreview');
    const fileName = document.getElementById('videoFileName');
    const player = document.getElementById('videoPlayer');
    
    if (input) input.value = '';
    if (preview) preview.style.display = 'none';
    if (fileName) fileName.textContent = 'Click here to select video file';
    if (player) {
        player.pause();
        URL.revokeObjectURL(player.src);
        player.src = '';
    }
}

// ========================================
// ENVÍO DE FORMULARIO - MEJORADO
// ========================================

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<div class="spinner"></div>Uploading...`;
        
        const formData = new FormData(event.target);
        const data = {
            action: 'submitExperience',
            studentName: formData.get('studentName'),
            experience: formData.get('experience')
        };
        
        console.log('📤 Preparando datos para envío...');
        
        const audioFile = formData.get('audioFile');
        const videoFile = formData.get('videoFile');
        
        if (audioFile && audioFile.size > 0) {
            showMessage('Processing audio...', 'info');
            console.log('🎵 Convirtiendo audio a base64...');
            data.audioFile = await fileToBase64(audioFile);
            console.log('✅ Audio convertido');
        }
        
        if (videoFile && videoFile.size > 0) {
            showMessage('Processing video...', 'info');
            console.log('🎥 Convirtiendo video a base64...');
            data.videoFile = await fileToBase64(videoFile);
            console.log('✅ Video convertido');
        }
        
        showMessage('Submitting experience...', 'info');
        console.log('📨 Enviando datos al servidor...');
        
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        console.log('📥 Respuesta del servidor:', result);
        
        if (result.success) {
            showMessage('Experience shared successfully!', 'success');
            console.log('✅ Experiencia guardada con medios:', result.data.mediaInfo);
            
            event.target.reset();
            removeAudio();
            removeVideo();
            
            await loadPublications();
            
            const forumSection = document.getElementById('forumSection');
            if (forumSection) {
                forumSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            throw new Error(result.message || 'Error al enviar');
        }
        
    } catch (error) {
        console.error('❌ Error enviando experiencia:', error);
        showMessage('Error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ========================================
// CARGAR PUBLICACIONES - MEJORADO
// ========================================

async function loadPublications() {
    const container = document.getElementById('experiencesContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const emptyState = document.getElementById('emptyState');
    
    try {
        console.log('📋 Cargando publicaciones...');
        
        if (loadingSpinner) loadingSpinner.style.display = 'flex';
        if (emptyState) emptyState.style.display = 'none';
        
        const url = `${API_URL}?action=getExperiencias&t=${Date.now()}`;
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('📥 Respuesta de publicaciones:', {
            success: result.success,
            count: result.count,
            hasData: !!result.data
        });
        
        if (result.success) {
            // Filtrar publicaciones vacías (por si el backend no las filtró)
            const validPublications = (result.data || []).filter(pub => 
                pub.id && pub.id !== '' && pub.studentName && pub.studentName !== ''
            );
            
            allPublications = validPublications;
            filteredPublications = [...allPublications];
            
            console.log(`📊 Publicaciones cargadas: ${allPublications.length}`);
            
            // Log de medios
            const withAudio = allPublications.filter(p => p.audioUrl && p.audioUrl !== '').length;
            const withVideo = allPublications.filter(p => p.videoUrl && p.videoUrl !== '').length;
            console.log(`🎵 Con audio: ${withAudio}, 🎥 Con video: ${withVideo}`);
            
            if (allPublications.length === 0) {
                showEmptyState();
            } else {
                displayPublications();
            }
        } else {
            throw new Error(result.message || 'Error al cargar publicaciones');
        }
        
    } catch (error) {
        console.error('❌ Error cargando publicaciones:', error);
        showMessage('Error loading: ' + error.message, 'error');
        showEmptyState();
    } finally {
        if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
}

function displayPublications() {
    const container = document.getElementById('experiencesContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (!container) return;
    if (emptyState) emptyState.style.display = 'none';
    
    const totalPages = Math.ceil(filteredPublications.length / publicationsPerPage);
    const startIndex = (currentPage - 1) * publicationsPerPage;
    const endIndex = startIndex + publicationsPerPage;
    const publicationsToShow = filteredPublications.slice(startIndex, endIndex);
    
    console.log(`📄 Mostrando página ${currentPage}, publicaciones ${startIndex}-${endIndex}`);
    
    container.innerHTML = publicationsToShow.map(pub => {
        console.log(`🔍 Publicación ${pub.id}: Audio=${!!pub.audioUrl}, Video=${!!pub.videoUrl}`);
        return generatePublicationHTML(pub);
    }).join('');
    
    updatePagination(totalPages);
    setupMediaPlayers();
    
    // Cargar comentarios para cada publicación
    publicationsToShow.forEach(async (pub) => {
        const comments = await loadComments(pub.id);
        const commentsContainer = document.getElementById(`comments-${pub.id}`);
        if (commentsContainer) {
            commentsContainer.innerHTML = renderCommentsList(comments, pub.id);
        }
    });
    
    // Setup character counter for comment inputs
    document.querySelectorAll('.comment-text-input').forEach(textarea => {
        const counter = textarea.closest('.comment-form').querySelector('.char-counter');
        
        textarea.addEventListener('input', () => {
            const length = textarea.value.length;
            counter.textContent = `${length}/500`;
            
            if (length > 450) {
                counter.style.color = '#ef4444';
            } else {
                counter.style.color = '#6b7280';
            }
        });
    });
}

// ========================================
// GENERAR HTML DE PUBLICACIÓN - MEJORADO
// ========================================

function generatePublicationHTML(pub) {
    const formattedDate = formatDate(pub.timestamp);
    const deleteButton = isAdminMode ? 
        `<button class="delete-btn" onclick="console.log('🖱️ Delete button clicked for:', '${pub.id}'); deletePublication('${pub.id}')" title="Delete">
            <svg class="icon-btn-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
        </button>` : '';
    
    return `
        <div class="publication-card" data-id="${pub.id}">
            <div class="publication-header">
                <div class="student-info">
                    <div class="student-avatar">
                        <svg class="icon-avatar" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </div>
                    <div class="student-details">
                        <h3 class="student-name">${escapeHtml(pub.studentName)}</h3>
                        <p class="publication-date">
                            <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            ${formattedDate}
                        </p>
                    </div>
                </div>
                <div class="publication-actions">
                    ${deleteButton}
                    ${isAdminMode ? `
                    <button class="folder-btn" onclick="openFolder('${pub.folderUrl}')" title="Ver archivos">
                        <svg class="icon-btn-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                        </svg>
                    </button>
                    ` : ''}
                </div>
            </div>
            
            <div class="publication-content">
                <div class="experience-text">
                    <svg class="icon-content" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    <p>${escapeHtml(pub.experience)}</p>
                </div>
                
                ${generateMediaHTMLImproved(pub)}
            </div>
            
            <div class="publication-footer">
                <div class="publication-stats">
                    <span class="stat-item">
                        <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16"/>
                        </svg>
                        ID: ${pub.id.split('-')[1]}
                    </span>
                    ${pub.mediaInfo && (pub.mediaInfo.hasAudio || pub.mediaInfo.hasVideo) ? `
                        <span class="stat-item">
                            <svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4"/>
                            </svg>
                            Media:
                            ${pub.mediaInfo.hasAudio ? '<svg class="icon-inline-small" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/></svg>' : ''}
                            ${pub.mediaInfo.hasVideo ? '<svg class="icon-inline-small" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>' : ''}
                        </span>
                    ` : ''}
                </div>
                
                <div class="publication-links">
                    ${pub.documentUrl ? `
                        <a href="${pub.documentUrl}" target="_blank" class="link-btn" title="Ver documento">
                            <svg class="icon-btn-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            Documento
                        </a>
                    ` : ''}
                </div>
            </div>
            
            <!-- Comments Section COLLAPSIBLE -->
            <div class="comments-section" data-pub-id="${pub.id}">
                <button class="comments-toggle" onclick="toggleComments('${pub.id}')" type="button">
                    <div class="comments-toggle-header">
                        <svg class="icon-comments" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        <h4>Comments</h4>
                        <span class="comments-count" id="count-${pub.id}">0</span>
                    </div>
                    <svg class="icon-chevron" id="chevron-${pub.id}" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                
                <div class="comments-content" id="content-${pub.id}" style="display: none;">
                    <!-- Comment Form -->
                    <form class="comment-form" onsubmit="submitCommentForm(event, '${pub.id}')">
                        <input 
                            type="text" 
                            class="comment-name-input" 
                            placeholder="Your name" 
                            maxlength="50"
                            required
                        />
                        <textarea 
                            class="comment-text-input" 
                            placeholder="Write your comment (max 500 characters)..." 
                            rows="3"
                            maxlength="500"
                            required
                        ></textarea>
                        <div class="comment-form-footer">
                            <span class="char-counter">0/500</span>
                            <button type="submit" class="comment-submit-btn">
                                <svg class="icon-send" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="transform: rotate(90deg);">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                                </svg>
                                Comment
                            </button>
                        </div>
                    </form>
                    
                    <!-- Comments List -->
                    <div class="comments-list" id="comments-${pub.id}">
                        <div class="loading-comments">Loading comments...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========================================
// GENERAR HTML DE MEDIOS - SOLO LINKS
// ========================================

function generateMediaHTMLImproved(pub) {
    let mediaHTML = '';

    if (!pub.audioUrl && !pub.videoUrl) {
        console.log(`ℹ️ Publicación ${pub.id}: Sin archivos multimedia`);
        return mediaHTML;
    }

    console.log(`🎬 Publicación ${pub.id}: Generando links para medios`);

    mediaHTML += '<div class="media-section">';

    if (pub.audioUrl && pub.audioUrl.trim() !== '') {
        console.log(`🎵 Agregando link de audio para ${pub.id}`);

        mediaHTML += `
            <a href="${pub.audioUrl}" target="_blank" class="media-link audio-link">
                <div class="media-link-icon">
                    <svg class="icon-media-link" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                    </svg>
                </div>
                <div class="media-link-content">
                    <strong class="media-link-title">Audio Recording</strong>
                    ${pub.mediaInfo && pub.mediaInfo.audioFileName ? `<span class="media-link-filename">${pub.mediaInfo.audioFileName}</span>` : '<span class="media-link-filename">Click to open audio file</span>'}
                </div>
                <div class="media-link-arrow">
                    <svg class="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                </div>
            </a>
        `;
    }

    if (pub.videoUrl && pub.videoUrl.trim() !== '') {
        console.log(`🎥 Agregando link de video para ${pub.id}`);

        mediaHTML += `
            <a href="${pub.videoUrl}" target="_blank" class="media-link video-link">
                <div class="media-link-icon">
                    <svg class="icon-media-link" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                </div>
                <div class="media-link-content">
                    <strong class="media-link-title">Video Recording</strong>
                    ${pub.mediaInfo && pub.mediaInfo.videoFileName ? `<span class="media-link-filename">${pub.mediaInfo.videoFileName}</span>` : '<span class="media-link-filename">Click to open video file</span>'}
                </div>
                <div class="media-link-arrow">
                    <svg class="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                </div>
            </a>
        `;
    }

    mediaHTML += '</div>';

    return mediaHTML;
}

// ========================================
// SETUP MEDIA LINKS
// ========================================

function setupMediaPlayers() {
    // Ya no necesitamos configurar reproductores
    // Solo usamos links directos a Drive
    console.log('📎 Media links configurados');
}

// ========================================
// RESTO DE FUNCIONES (búsqueda, admin, etc.)
// ========================================

function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    
    if (query === '') {
        filteredPublications = [...allPublications];
    } else {
        filteredPublications = allPublications.filter(pub => 
            pub.studentName.toLowerCase().includes(query) ||
            pub.experience.toLowerCase().includes(query) ||
            pub.id.toLowerCase().includes(query)
        );
    }
    
    currentPage = 1;
    displayPublications();
}

function showEmptyState() {
    const container = document.getElementById('experiencesContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (container) container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
}

// ========================================
// FUNCIONES DE ADMIN Y UTILIDADES
// ========================================

function setupPaginationHandlers() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayPublications();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredPublications.length / publicationsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayPublications();
            }
        });
    }
}

function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const paginationInfo = document.getElementById('paginationInfo');
    
    if (totalPages <= 1) {
        if (pagination) pagination.style.display = 'none';
        return;
    }
    
    if (pagination) pagination.style.display = 'flex';
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    if (paginationInfo) paginationInfo.textContent = `Página ${currentPage} de ${totalPages}`;
}

function setupModalHandlers() {
    const modal = document.getElementById('adminModal');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const passwordInput = document.getElementById('adminPassword');
    
    if (cancelBtn) cancelBtn.addEventListener('click', hideAdminModal);
    if (confirmBtn) confirmBtn.addEventListener('click', handleAdminLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', disableAdminMode);
    
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAdminLogin();
        });
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideAdminModal();
        });
    }
}

function showAdminModal() {
    const modal = document.getElementById('adminModal');
    const passwordInput = document.getElementById('adminPassword');
    const errorDiv = document.getElementById('modalError');
    
    if (modal) modal.style.display = 'flex';
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
    }
    if (errorDiv) errorDiv.style.display = 'none';
}

function hideAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.style.display = 'none';
}

async function handleAdminLogin() {
    const passwordInput = document.getElementById('adminPassword');
    const confirmBtn = document.getElementById('modalConfirmBtn');
    
    const password = passwordInput.value.trim();
    if (!password) {
        showModalError('Ingresa la contraseña');
        return;
    }
    
    try {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Validando...';
        
        const url = `${API_URL}?action=validateAdmin&password=${encodeURIComponent(password)}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success && result.data.valid) {
            enableAdminMode();
            hideAdminModal();
            showMessage('Admin access granted', 'success');
            localStorage.setItem('adminMode', 'true');
        } else {
            showModalError('Contraseña inválida');
        }
        
    } catch (error) {
        showModalError('Error validando contraseña');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Login';
    }
}

function showModalError(message) {
    const errorDiv = document.getElementById('modalError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

function enableAdminMode() {
    isAdminMode = true;
    
    const adminBanner = document.getElementById('adminBanner');
    const cleanBtn = document.getElementById('cleanBtn');
    const adminBtn = document.getElementById('adminBtn');
    
    if (adminBanner) adminBanner.style.display = 'flex';
    if (cleanBtn) cleanBtn.style.display = 'inline-flex';
    if (adminBtn) adminBtn.style.display = 'none'; // Ocultar botón Admin
    
    displayPublications();
}

function disableAdminMode() {
    isAdminMode = false;
    
    const adminBanner = document.getElementById('adminBanner');
    const cleanBtn = document.getElementById('cleanBtn');
    const adminBtn = document.getElementById('adminBtn');
    
    if (adminBanner) adminBanner.style.display = 'none';
    if (cleanBtn) cleanBtn.style.display = 'none';
    if (adminBtn) adminBtn.style.display = 'inline-flex'; // Mostrar botón Admin de nuevo
    
    localStorage.removeItem('adminMode');
    displayPublications();
    showMessage('Admin mode deactivated', 'info');
}

async function deletePublication(publicationId) {
    console.log('🗑️ deletePublication called');
    console.log('📍 Publication ID:', publicationId);
    console.log('🔐 Admin mode:', isAdminMode);
    
    if (!isAdminMode) {
        console.log('❌ Not in admin mode, aborting');
        return;
    }
    
    if (!confirm('Delete this publication? This cannot be undone.')) {
        console.log('❌ User cancelled deletion');
        return;
    }
    
    try {
        console.log('✅ Starting deletion process...');
        showMessage('Deleting...', 'info');
        
        const password = 'Ldirinem2025';
        
        // Usar GET con el nombre correcto: deleteExperiencia
        const params = new URLSearchParams({
            action: 'deleteExperiencia',
            id: publicationId,
            password: password,
            t: Date.now()
        });
        
        const url = `${API_URL}?${params.toString()}`;
        console.log('🌐 Calling URL:', url);
        
        const response = await fetch(url);
        console.log('📥 Response status:', response.status);
        console.log('📥 Response ok:', response.ok);
        
        const result = await response.json();
        console.log('📦 Result:', JSON.stringify(result, null, 2));
        
        if (result.success) {
            console.log('✅ Deletion successful!');
            showMessage('Publication deleted', 'success');
            console.log('🔄 Reloading publications...');
            await loadPublications();
            console.log('✅ Publications reloaded');
        } else {
            console.log('❌ Deletion failed:', result.message);
            throw new Error(result.message || 'Error deleting');
        }
        
    } catch (error) {
        console.error('❌ ERROR in deletePublication:', error);
        console.error('Error stack:', error.stack);
        showMessage('Error deleting: ' + error.message, 'error');
    }
}

// ========================================
// SISTEMA DE COMENTARIOS
// ========================================

async function loadComments(publicationId) {
    try {
        const url = `${API_URL}?action=getComments&publicationId=${encodeURIComponent(publicationId)}&t=${Date.now()}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            return result.data.comments || [];
        }
        return [];
    } catch (error) {
        console.error('Error loading comments:', error);
        return [];
    }
}

async function submitCommentForm(event, publicationId) {
    event.preventDefault();
    
    const form = event.target;
    const nameInput = form.querySelector('.comment-name-input');
    const commentInput = form.querySelector('.comment-text-input');
    const submitBtn = form.querySelector('.comment-submit-btn');
    
    const name = nameInput.value.trim();
    const comment = commentInput.value.trim();
    
    if (!name || !comment) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    if (comment.length > 500) {
        showMessage('Comment is too long (máximo 500 caracteres)', 'error');
        return;
    }
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        // Usar GET en lugar de POST para evitar CORS
        const params = new URLSearchParams({
            action: 'submitComment',
            publicationId: publicationId,
            name: name,
            comment: comment,
            t: Date.now() // Cache buster
        });
        
        const response = await fetch(`${API_URL}?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
            showMessage('Comment posted', 'success');
            nameInput.value = '';
            commentInput.value = '';
            
            // Recargar comentarios
            await refreshComments(publicationId);
        } else {
            throw new Error(result.message || 'Error posting comment');
        }
        
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Comment';
    }
}

async function deleteCommentBtn(publicationId, commentId) {
    if (!isAdminMode) return;
    
    if (!confirm('Delete this comment?')) return;
    
    try {
        const password = 'Ldirinem2025';
        
        // Usar GET en lugar de POST para evitar CORS
        const params = new URLSearchParams({
            action: 'deleteComment',
            publicationId: publicationId,
            commentId: commentId,
            password: password,
            t: Date.now() // Cache buster
        });
        
        const response = await fetch(`${API_URL}?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
            showMessage('Comment deleted', 'success');
            await refreshComments(publicationId);
        } else {
            throw new Error(result.message || 'Error deleting');
        }
        
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

async function refreshComments(publicationId) {
    const commentsContainer = document.querySelector(`[data-pub-id="${publicationId}"] .comments-list`);
    if (!commentsContainer) return;
    
    const comments = await loadComments(publicationId);
    commentsContainer.innerHTML = renderCommentsList(comments, publicationId);
    
    // Actualizar contador
    updateCommentsCount(publicationId, comments.length);
}

function toggleComments(publicationId) {
    const content = document.getElementById(`content-${publicationId}`);
    const chevron = document.getElementById(`chevron-${publicationId}`);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        chevron.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
}

function updateCommentsCount(publicationId, count) {
    const countElement = document.getElementById(`count-${publicationId}`);
    if (countElement) {
        countElement.textContent = count;
        countElement.style.display = count > 0 ? 'flex' : 'none';
    }
}

function renderCommentsList(comments, publicationId) {
    // Actualizar el contador
    updateCommentsCount(publicationId, comments.length);
    
    if (comments.length === 0) {
        return `
            <div class="no-comments">
                <svg class="icon-no-comments" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <p>No comments yet. Be the first to comment!</p>
            </div>
        `;
    }
    
    return comments.map(c => {
        const deleteBtn = isAdminMode ? `
            <button class="comment-delete-btn" onclick="deleteCommentBtn('${publicationId}', '${c.id}')" title="Delete comment">
                <svg class="icon-delete-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
            </button>
        ` : '';
        
        return `
            <div class="comment-item">
                <div class="comment-header">
                    <div class="comment-author">
                        <svg class="icon-user-comment" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        <strong>${escapeHtml(c.name)}</strong>
                    </div>
                    <div class="comment-meta">
                        <span class="comment-date">${formatDate(c.timestamp)}</span>
                        ${deleteBtn}
                    </div>
                </div>
                <p class="comment-text">${escapeHtml(c.comment)}</p>
            </div>
        `;
    }).join('');
}

async function cleanOrphanRecords() {
    if (!isAdminMode) return;
    
    if (!confirm('¿Limpiar registros huérfanos?')) return;
    
    try {
        showMessage('Limpiando...', 'info');
        
        const password = 'Ldirinem2025';
        const url = `${API_URL}?action=cleanOrphanRecords&password=${encodeURIComponent(password)}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            showMessage(`Limpieza completa. ${result.data.deleted} registros eliminados.`, 'success');
            if (result.data.deleted > 0) {
                await loadPublications();
            }
        } else {
            throw new Error(result.message);
        }
        
    } catch (error) {
        showMessage('Error clearing: ' + error.message, 'error');
    }
}

// ========================================
// UTILIDADES
// ========================================

function openFolder(folderUrl) {
    if (folderUrl) window.open(folderUrl, '_blank');
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showMessage(message, type = 'info') {
    const statusDiv = document.getElementById('statusMessage');
    if (!statusDiv) return;
    
    statusDiv.className = `status-message ${type}`;
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 5000);
}