// ========================================
// CONFIGURACIÓN PRINCIPAL
// ========================================

// ID de tu carpeta de Google Drive
const FOLDER_ID = '1YJI7AJe7_RWHRWiY5yT-ZK8w69iMkDs9';

// Nombre de la hoja de calculo
const SPREADSHEET_NAME = 'Student Experiences Database';

// Blogging content storage. Files can be uploaded directly to the pending
// folder in Drive and then classified from the admin UI/API.
const BLOGGING_ROOT_FOLDER_NAME = 'Videos Blogging M';
const BLOGGING_PENDING_FOLDER_NAME = '00 Pending Review';
const BLOGGING_SPREADSHEET_NAME = 'Blogging Content Database';
const BLOGGING_SPREADSHEET_ID = '1hOcffrl_GUo27K7QLL0Rm7ozVPmRuiT5gZtjFFwXtwU';

const BLOGGING_SECTIONS = [
  {
    id: 'introduction',
    label: 'Introduction & Tests',
    allowedTypes: ['video']
  },
  {
    id: 'tourist-places',
    label: 'Tourist Places in Narino',
    aliases: ['Tourist Places in Nariño', 'Tourist places in Nariño', 'Tourist places in Narino'],
    allowedTypes: ['photo', 'miniblog', 'roleplay', 'video']
  },
  {
    id: 'food',
    label: 'Food from Narino',
    aliases: ['Food from Nariño'],
    allowedTypes: ['photo', 'miniblog', 'roleplay', 'video']
  },
  {
    id: 'carnival',
    label: 'Discovering Our Carnival',
    allowedTypes: ['photo', 'miniblog', 'roleplay', 'video']
  },
  {
    id: 'crafts',
    label: 'Crafts from My Narino',
    aliases: ['Crafts from My Nariño', 'Crafts from Nariño', 'Crafts from Narino'],
    allowedTypes: ['photo', 'miniblog', 'roleplay', 'video']
  },
  {
    id: 'evaluation',
    label: 'Evaluation',
    allowedTypes: ['video']
  }
];

const BLOGGING_CONTENT_TYPES = {
  photo: 'Photos',
  miniblog: 'Mini Blogs',
  roleplay: 'Roleplays',
  video: 'Videos'
};

const BLOGGING_FOLDER_PROPERTY_PREFIX = 'blogging.folder.';
const BLOGGING_SPREADSHEET_PROPERTY = 'blogging.spreadsheet.id';
const BLOGGING_CONTENT_CACHE_VERSION_PROPERTY = 'blogging.content.cache.version';
const BLOGGING_CONTENT_CACHE_TTL_SECONDS = 300;
const BLOGGING_EMPTY_CONTENT_CACHE_TTL_SECONDS = 15;
const BLOGGING_MANIFEST_PROPERTY_PREFIX = 'blogging.manifest.chunk.';
const BLOGGING_MANIFEST_CHUNK_COUNT_PROPERTY = 'blogging.manifest.chunk.count';
const BLOGGING_MANIFEST_UPDATED_PROPERTY = 'blogging.manifest.updated';
const BLOGGING_MANIFEST_CHUNK_SIZE = 8000;

// Contraseña de administrador (solo para eliminar - validación backend)
const ADMIN_PASSWORD = 'Ldirinem2025';

// ========================================
// FUNCIÓN HELPER PARA RESPUESTAS CON CORS
// ========================================

function createResponse(jsonData) {
  var output = ContentService.createTextOutput(JSON.stringify(jsonData));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // Google Apps Script no soporta setHeader() - Los headers CORS se manejan automáticamente
  // cuando despliegas como "Web app" con acceso "Anyone"
  
  return output;
}

// ========================================
// MANEJO DE PETICIONES GET
// ========================================

function doGet(e) {
  Logger.log('=== GET REQUEST RECEIVED ===');
  Logger.log('GET parameters: ' + JSON.stringify(e));

  try {
    // Verificar si se solicita obtener experiencias
    if (e.parameter && e.parameter.action === 'getExperiencias') {
      Logger.log('🔍 Solicitud de getExperiencias recibida');
      return getExperiencias(e);
    }

    if (e.parameter && e.parameter.action === 'initializeBloggingFolders') {
      Logger.log('Blogging folder initialization requested');
      return initializeBloggingFoldersFromGet(e);
    }

    if (e.parameter && e.parameter.action === 'scanBloggingUploads') {
      Logger.log('Blogging upload scan requested');
      return scanBloggingUploadsFromGet(e);
    }

    if (e.parameter && e.parameter.action === 'installBloggingDriveScanner') {
      Logger.log('Blogging drive scanner install requested');
      return installBloggingDriveScannerFromGet(e);
    }

    if (e.parameter && e.parameter.action === 'consolidateBloggingFolders') {
      Logger.log('Blogging duplicate consolidation requested');
      return consolidateBloggingFoldersFromGet(e);
    }

    if (e.parameter && e.parameter.action === 'getBloggingContent') {
      Logger.log('Blogging content requested');
      return getBloggingContent(e);
    }

    if (e.parameter && e.parameter.action === 'getBloggingDebug') {
      Logger.log('Blogging debug requested');
      return getBloggingDebug(e);
    }

    // Verificar si se solicitan comentarios
    if (e.parameter && e.parameter.action === 'getComments') {
      Logger.log('💬 Solicitud de getComments recibida');
      return getComments(e);
    }

    // Verificar validación de admin
    if (e.parameter && e.parameter.action === 'validateAdmin') {
      Logger.log('🔐 Solicitud de validación de admin');
      return validateAdmin(e);
    }

    // Enviar comentario (ahora también por GET)
    if (e.parameter && e.parameter.action === 'submitComment') {
      Logger.log('💬 Solicitud de submitComment recibida por GET');
      return submitCommentFromGet(e);
    }

    // Eliminar comentario (ahora también por GET)
    if (e.parameter && e.parameter.action === 'deleteComment') {
      Logger.log('🗑️ Solicitud de deleteComment recibida por GET');
      return deleteCommentFromGet(e);
    }

    // Eliminar experiencia (ahora también por GET)
    if (e.parameter && e.parameter.action === 'deleteExperiencia') {
      Logger.log('🗑️ Solicitud de deleteExperiencia recibida por GET');
      return deleteExperienciaFromGet(e);
    }

    // Respuesta por defecto para GET sin parámetros
    return createResponse({
      success: true,
      message: 'Student Experience API is running',
      timestamp: new Date().toISOString(),
      info: 'Use POST method to submit experiences',
      version: '6.0-COMMENTS',
      endpoints: {
        POST: [
          'action=submitExperience (default)',
          'action=deleteExperiencia'
        ],
        GET: [
          'action=getExperiencias',
          'action=getComments',
          'action=validateAdmin',
          'action=submitComment',
          'action=deleteComment'
        ]
      }
    });

  } catch (error) {
    Logger.log('❌ ERROR in doGet: ' + error.toString());
    return createResponse({
      success: false,
      message: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
}

// ========================================
// MANEJO DE PREFLIGHT CORS (OPTIONS)
// ========================================

function doOptions(e) {
  Logger.log('=== OPTIONS REQUEST (CORS Preflight) ===');
  
  // Google Apps Script maneja CORS automáticamente cuando se despliega como "Web app"
  var output = ContentService.createTextOutput('');
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ========================================
// MANEJO DE PETICIONES POST
// ========================================

function doPost(e) {
  try {
    Logger.log('=== NEW POST REQUEST ===');
    Logger.log('Request received at: ' + new Date());

    // VALIDACIÓN: Verificar que 'e' existe
    if (!e) {
      Logger.log('ERROR: Parameter e is undefined');
      throw new Error('Request parameter is undefined');
    }

    Logger.log('Request object keys: ' + Object.keys(e));
    Logger.log('Has postData: ' + (!!e.postData));

    // VALIDACIÓN: Verificar que postData existe
    if (!e.postData) {
      Logger.log('ERROR: postData is undefined');
      throw new Error('No postData received - make sure request is POST method');
    }

    Logger.log('PostData keys: ' + Object.keys(e.postData));
    Logger.log('Has contents: ' + (!!e.postData.contents));

    // VALIDACIÓN: Verificar que contents existe
    if (!e.postData.contents) {
      Logger.log('ERROR: postData.contents is undefined');
      throw new Error('No data contents received in POST request');
    }

    Logger.log('Raw data length: ' + e.postData.contents.length);
    Logger.log('Raw data preview: ' + e.postData.contents.substring(0, 200) + '...');

    let data;
    try {
      data = JSON.parse(e.postData.contents);
      Logger.log('JSON parsing successful');
    } catch (parseError) {
      Logger.log('JSON parsing failed: ' + parseError.toString());
      throw new Error('Invalid JSON data: ' + parseError.message);
    }

    Logger.log('Parsed data keys: ' + Object.keys(data));

    // ROUTER: Determinar qué acción ejecutar
    const action = data.action || 'submitExperience';
    Logger.log('📍 Action requested: ' + action);

    let result;

    switch(action) {
      case 'deleteExperiencia':
        Logger.log('🗑️ Solicitando eliminación de experiencia...');
        result = deleteExperiencia(data);
        break;

      case 'submitComment':
        Logger.log('💬 Guardando nuevo comentario...');
        result = submitComment(data);
        break;

      case 'deleteComment':
        Logger.log('🗑️ Eliminando comentario...');
        result = deleteComment(data);
        break;

      case 'initializeBloggingFolders':
        Logger.log('Initializing blogging folder structure...');
        result = initializeBloggingFolders(data);
        break;

      case 'scanBloggingUploads':
        Logger.log('Scanning blogging uploads...');
        result = scanBloggingUploads(data);
        break;

      case 'consolidateBloggingFolders':
        Logger.log('Consolidating duplicate blogging folders...');
        result = consolidateBloggingFolders(data);
        break;

      case 'uploadBloggingContentBatch':
        Logger.log('Uploading blogging content batch...');
        result = uploadBloggingContentBatch(data);
        break;

      case 'updateBloggingContentBatch':
        Logger.log('Updating blogging content batch...');
        result = updateBloggingContentBatch(data);
        break;

      case 'deleteBloggingContentBatch':
        Logger.log('Deleting blogging content batch...');
        result = deleteBloggingContentBatch(data);
        break;

      case 'submitExperience':
      default:
        Logger.log('📝 Guardando nueva experiencia...');

        // Validar datos requeridos
        Logger.log('Student name: ' + (data.studentName || 'NOT PROVIDED'));
        Logger.log('Experience length: ' + (data.experience ? data.experience.length : 'NOT PROVIDED'));
        Logger.log('Has audio: ' + (!!data.audioFile));
        Logger.log('Has video: ' + (!!data.videoFile));
        Logger.log('Timestamp: ' + (data.timestamp || 'NOT PROVIDED'));

        if (!data.studentName || !data.experience) {
          throw new Error('Missing required fields: studentName and experience are required');
        }

        // Verificar acceso a la carpeta
        try {
          const testFolder = DriveApp.getFolderById(FOLDER_ID);
          Logger.log('✅ Folder access successful: ' + testFolder.getName());
        } catch (folderError) {
          Logger.log('❌ Folder access error: ' + folderError.toString());
          throw new Error('Cannot access Google Drive folder with ID: ' + FOLDER_ID + '. Error: ' + folderError.message);
        }

        // Guardar la experiencia
        Logger.log('Starting saveExperience...');
        result = saveExperience(data);
        Logger.log('✅ Experience saved successfully');
        break;
    }

    const response = {
      success: true,
      message: 'Operation completed successfully',
      action: action,
      data: result,
      timestamp: new Date().toISOString()
    };

    Logger.log('Sending success response');

    return createResponse(response);

  } catch (error) {
    Logger.log('❌ CRITICAL ERROR in doPost: ' + error.toString());
    Logger.log('Error name: ' + error.name);
    Logger.log('Error stack: ' + error.stack);

    const errorResponse = {
      success: false,
      message: error.toString(),
      error: error.name || 'UnknownError',
      timestamp: new Date().toISOString()
    };

    Logger.log('Sending error response');

    return createResponse(errorResponse);
  }
}

// ========================================
// GUARDAR NUEVA EXPERIENCIA
// ========================================

function saveExperience(data) {
  try {
    Logger.log('🔄 Starting saveExperience function');

    const folder = DriveApp.getFolderById(FOLDER_ID);
    Logger.log('📁 Got folder: ' + folder.getName());

    const spreadsheet = getOrCreateSpreadsheet(folder);
    const sheet = spreadsheet.getActiveSheet();
    Logger.log('📊 Got spreadsheet: ' + spreadsheet.getName());

    // Generar ID único
    const uniqueId = generateUniqueId();
    Logger.log('🔑 Generated unique ID: ' + uniqueId);

    // Crear nombre de carpeta
    const timestamp = new Date(data.timestamp);
    const dateStr = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'yyyy-MM-dd_HH-mm');
    const studentFolderName = `${data.studentName} - ${dateStr}`;

    Logger.log('📂 Creating student folder: ' + studentFolderName);

    // Crear carpeta del estudiante
    const studentFolder = folder.createFolder(studentFolderName);
    Logger.log('✅ Student folder created: ' + studentFolder.getName());

    let audioUrl = '';
    let videoUrl = '';
    let audioFileId = '';
    let videoFileId = '';

    // Guardar archivo de audio si existe
    if (data.audioFile && data.audioFile.data) {
      try {
        Logger.log('🎵 Processing audio file: ' + data.audioFile.name);
        const audioBlob = Utilities.newBlob(
          Utilities.base64Decode(data.audioFile.data),
          data.audioFile.mimeType,
          data.audioFile.name
        );
        const audioFile = studentFolder.createFile(audioBlob);

        // Hacer el archivo público para que pueda reproducirse
        audioFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        audioFileId = audioFile.getId();
        // Guardar URL en formato directo para reproducción
        audioUrl = `https://drive.google.com/uc?export=download&id=${audioFileId}`;

        Logger.log('✅ Audio file saved with ID: ' + audioFileId);
        Logger.log('🔗 Direct Audio URL: ' + audioUrl);
      } catch (audioError) {
        Logger.log('⚠️ Error saving audio: ' + audioError.toString());
      }
    }

    // Guardar archivo de video si existe
    if (data.videoFile && data.videoFile.data) {
      try {
        Logger.log('🎥 Processing video file: ' + data.videoFile.name);
        const videoBlob = Utilities.newBlob(
          Utilities.base64Decode(data.videoFile.data),
          data.videoFile.mimeType,
          data.videoFile.name
        );
        const videoFile = studentFolder.createFile(videoBlob);

        // Hacer el archivo público para que pueda reproducirse
        videoFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

        videoFileId = videoFile.getId();
        // Guardar URL en formato directo para reproducción
        videoUrl = `https://drive.google.com/uc?export=download&id=${videoFileId}`;

        Logger.log('✅ Video file saved with ID: ' + videoFileId);
        Logger.log('🔗 Direct Video URL: ' + videoUrl);
      } catch (videoError) {
        Logger.log('⚠️ Error saving video: ' + videoError.toString());
      }
    }

    // Crear documento descriptivo
    Logger.log('📄 Creating student document');
    const docFile = createStudentDocument(
      studentFolder,
      data.studentName,
      data.experience,
      timestamp,
      audioUrl,
      videoUrl,
      data.audioFile ? data.audioFile.name : '',
      data.videoFile ? data.videoFile.name : ''
    );
    Logger.log('✅ Document created: ' + docFile.getName());

    // Guardar en la hoja de calculo
    Logger.log('📝 Adding row to spreadsheet');
    sheet.appendRow([
      uniqueId,
      timestamp,
      data.studentName,
      data.experience,
      audioUrl,
      videoUrl,
      studentFolder.getUrl(),
      docFile.getUrl(),
      studentFolder.getId()
    ]);
    Logger.log('✅ Row added to spreadsheet');

    const result = {
      id: uniqueId,
      studentName: data.studentName,
      timestamp: data.timestamp,
      audioUrl: audioUrl,
      videoUrl: videoUrl,
      folderUrl: studentFolder.getUrl(),
      documentUrl: docFile.getUrl(),
      folderId: studentFolder.getId()
    };

    Logger.log('🎉 saveExperience completed successfully');

    return result;

  } catch (error) {
    Logger.log('❌ ERROR in saveExperience: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    throw error;
  }
}

// ========================================
// OBTENER TODAS LAS EXPERIENCIAS
// ========================================

function getExperiencias(e) {
  try {
    Logger.log('📚 Starting getExperiencias function');

    const folder = DriveApp.getFolderById(FOLDER_ID);
    const spreadsheet = getOrCreateSpreadsheet(folder);
    const sheet = spreadsheet.getActiveSheet();

    Logger.log('📊 Reading spreadsheet data...');

    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      Logger.log('📭 No experiences found');
      return createResponse({
        success: true,
        message: 'No experiences found',
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      });
    }

    // Leer todas las filas de datos
    const dataRange = sheet.getRange(2, 1, lastRow - 1, 9);
    const values = dataRange.getValues();

    Logger.log('📊 Found ' + values.length + ' experiences');

    // Transformar los datos y FILTRAR filas vacías
    const experiences = values
      .map(row => {
        return {
          id: row[0],
          timestamp: row[1],
          studentName: row[2],
          experience: row[3],
          audioUrl: row[4] || null,
          videoUrl: row[5] || null,
          folderUrl: row[6] || null,
          documentUrl: row[7] || null,
          folderId: row[8] || null
        };
      })
      .filter(exp => {
        // Filtrar solo las experiencias que tienen ID y nombre
        return exp.id && exp.id !== '' && exp.studentName && exp.studentName !== '';
      });

    Logger.log('📊 Valid experiences after filtering: ' + experiences.length);

    // Ordenar por fecha (más recientes primero)
    experiences.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    Logger.log('✅ Experiences retrieved and sorted');

    return createResponse({
      success: true,
      message: 'Experiences retrieved successfully',
      data: experiences,
      count: experiences.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    Logger.log('❌ ERROR in getExperiencias: ' + error.toString());

    return createResponse({
      success: false,
      message: error.toString(),
      error: error.name || 'UnknownError',
      timestamp: new Date().toISOString()
    });
  }
}

// ========================================
// ELIMINAR UNA EXPERIENCIA
// ========================================

function deleteExperiencia(data) {
  try {
    Logger.log('🗑️ Starting deleteExperiencia function');

    if (!data.id) {
      throw new Error('Experience ID is required');
    }

    // VALIDACIÓN BACKEND: Verificar contraseña para eliminar
    if (!data.password || data.password !== ADMIN_PASSWORD) {
      Logger.log('❌ Unauthorized deletion attempt');
      throw new Error('Unauthorized: Invalid admin credentials');
    }

    Logger.log('🔑 Admin validated, proceeding with deletion of ID: ' + data.id);

    const folder = DriveApp.getFolderById(FOLDER_ID);
    const spreadsheet = getOrCreateSpreadsheet(folder);
    const sheet = spreadsheet.getActiveSheet();

    const lastRow = sheet.getLastRow();
    let rowToDelete = -1;
    let folderId = null;

    for (let i = 2; i <= lastRow; i++) {
      const cellValue = sheet.getRange(i, 1).getValue();
      if (cellValue === data.id) {
        rowToDelete = i;
        folderId = sheet.getRange(i, 9).getValue();
        break;
      }
    }

    if (rowToDelete === -1) {
      throw new Error('Experience with ID "' + data.id + '" not found');
    }

    Logger.log('📍 Found experience at row: ' + rowToDelete);

    // Eliminar carpeta de Drive
    if (folderId) {
      try {
        const folderToDelete = DriveApp.getFolderById(folderId);
        folderToDelete.setTrashed(true);
        Logger.log('✅ Folder moved to trash: ' + folderId);
      } catch (folderError) {
        Logger.log('⚠️ Could not delete folder: ' + folderError.toString());
      }
    }

    // Eliminar fila del spreadsheet
    sheet.deleteRow(rowToDelete);
    Logger.log('✅ Row deleted from spreadsheet');
    Logger.log('🎉 Experience deleted successfully');

    return {
      deleted: true,
      id: data.id,
      message: 'Experience deleted successfully'
    };

  } catch (error) {
    Logger.log('❌ ERROR in deleteExperiencia: ' + error.toString());
    throw error;
  }
}

// ========================================
// CREAR DOCUMENTO DESCRIPTIVO
// ========================================

function createStudentDocument(folder, studentName, experience, timestamp, audioUrl, videoUrl, audioFileName, videoFileName) {
  try {
    Logger.log('📄 Creating Google Doc for: ' + studentName);

    const doc = DocumentApp.create(`${studentName} - English Experience`);
    const body = doc.getBody();

    const title = body.appendParagraph('🎓 Student Experience Submission');
    title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    body.appendHorizontalRule();
    body.appendParagraph('');

    const nameHeader = body.appendParagraph('👤 Student Name:');
    nameHeader.setBold(true);
    nameHeader.setFontSize(14);

    const nameValue = body.appendParagraph(studentName);
    nameValue.setIndentStart(20);
    nameValue.setFontSize(12);

    body.appendParagraph('');

    const dateHeader = body.appendParagraph('📅 Submission Date:');
    dateHeader.setBold(true);
    dateHeader.setFontSize(14);

    const dateValue = body.appendParagraph(Utilities.formatDate(timestamp, Session.getScriptTimeZone(), 'MMMM dd, yyyy - hh:mm a'));
    dateValue.setIndentStart(20);
    dateValue.setFontSize(12);

    body.appendParagraph('');
    body.appendHorizontalRule();
    body.appendParagraph('');

    const expHeader = body.appendParagraph('📝 English Learning Experience:');
    expHeader.setBold(true);
    expHeader.setFontSize(14);

    const expValue = body.appendParagraph(experience);
    expValue.setIndentStart(20);
    expValue.setFontSize(12);
    expValue.setLineSpacing(1.5);

    body.appendParagraph('');
    body.appendHorizontalRule();
    body.appendParagraph('');

    const filesHeader = body.appendParagraph('📎 Attached Files:');
    filesHeader.setBold(true);
    filesHeader.setFontSize(14);

    body.appendParagraph('');

    if (audioUrl) {
      const audioHeader = body.appendParagraph('🎵 Audio Recording:');
      audioHeader.setBold(true);
      audioHeader.setIndentStart(20);
      audioHeader.setFontSize(12);

      const audioLink = body.appendParagraph(`File: ${audioFileName}`);
      audioLink.setIndentStart(40);
      audioLink.setFontSize(11);

      const audioLinkText = body.appendParagraph('🔗 Click here to listen');
      audioLinkText.setIndentStart(40);
      audioLinkText.setFontSize(11);
      audioLinkText.setLinkUrl(audioUrl);
      audioLinkText.setForegroundColor('#1155CC');
      audioLinkText.setUnderline(true);

      body.appendParagraph('');
    }

    if (videoUrl) {
      const videoHeader = body.appendParagraph('🎥 Video Recording:');
      videoHeader.setBold(true);
      videoHeader.setIndentStart(20);
      videoHeader.setFontSize(12);

      const videoLink = body.appendParagraph(`File: ${videoFileName}`);
      videoLink.setIndentStart(40);
      videoLink.setFontSize(11);

      const videoLinkText = body.appendParagraph('🔗 Click here to watch');
      videoLinkText.setIndentStart(40);
      videoLinkText.setFontSize(11);
      videoLinkText.setLinkUrl(videoUrl);
      videoLinkText.setForegroundColor('#1155CC');
      videoLinkText.setUnderline(true);

      body.appendParagraph('');
    }

    if (!audioUrl && !videoUrl) {
      const noFiles = body.appendParagraph('📝 No audio or video files were uploaded.');
      noFiles.setIndentStart(20);
      noFiles.setFontSize(11);
      noFiles.setItalic(true);
      noFiles.setForegroundColor('#666666');
    }

    doc.saveAndClose();
    Logger.log('💾 Document saved');

    const docFile = DriveApp.getFileById(doc.getId());
    folder.addFile(docFile);
    DriveApp.getRootFolder().removeFile(docFile);
    Logger.log('📁 Document moved to folder');

    return docFile;

  } catch (error) {
    Logger.log('❌ ERROR creating document: ' + error.toString());
    throw error;
  }
}

// ========================================
// OBTENER O CREAR SPREADSHEET
// ========================================

function getOrCreateSpreadsheet(folder) {
  try {
    const files = folder.getFilesByName(SPREADSHEET_NAME);

    if (files.hasNext()) {
      const file = files.next();
      Logger.log('📊 Using existing spreadsheet');
      return SpreadsheetApp.openById(file.getId());
    } else {
      Logger.log('📊 Creating new spreadsheet');

      const spreadsheet = SpreadsheetApp.create(SPREADSHEET_NAME);
      const sheet = spreadsheet.getActiveSheet();

      sheet.appendRow([
        'ID',
        'Timestamp',
        'Student Name',
        'Experience',
        'Audio URL',
        'Video URL',
        'Folder URL',
        'Document URL',
        'Folder ID'
      ]);

      const headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#1e3a8a');
      headerRange.setFontColor('#ffffff');

      sheet.setColumnWidth(1, 180);
      sheet.setColumnWidth(2, 150);
      sheet.setColumnWidth(3, 150);
      sheet.setColumnWidth(4, 300);
      sheet.setColumnWidth(5, 200);
      sheet.setColumnWidth(6, 200);
      sheet.setColumnWidth(7, 200);
      sheet.setColumnWidth(8, 200);
      sheet.setColumnWidth(9, 200);

      const spreadsheetFile = DriveApp.getFileById(spreadsheet.getId());
      folder.addFile(spreadsheetFile);
      DriveApp.getRootFolder().removeFile(spreadsheetFile);

      Logger.log('✅ Spreadsheet created');
      return spreadsheet;
    }
  } catch (error) {
    Logger.log('❌ ERROR with spreadsheet: ' + error.toString());
    throw error;
  }
}

// ========================================
// GENERAR ID ÚNICO
// ========================================

// ========================================
// BLOGGING CONTENT DRIVE STRUCTURE
// ========================================

function initializeBloggingFolders(data) {
  if (data && data.password !== ADMIN_PASSWORD) {
    throw new Error('Unauthorized: Invalid admin credentials');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    return buildBloggingFolderStructure();
  } finally {
    lock.releaseLock();
  }
}

function buildBloggingFolderStructure() {
  const baseFolder = DriveApp.getFolderById(FOLDER_ID);
  const bloggingRoot = getOrCreateManagedChildFolder(
    baseFolder,
    BLOGGING_ROOT_FOLDER_NAME,
    'root',
    ['videos blogging M', 'Videos blogging M']
  );
  const pendingFolder = getOrCreateManagedChildFolder(
    bloggingRoot,
    BLOGGING_PENDING_FOLDER_NAME,
    'pending',
    ['Pending Review', 'Pending Uploads']
  );
  const spreadsheet = getOrCreateBloggingSpreadsheet(bloggingRoot);
  const folders = [];

  BLOGGING_SECTIONS.forEach(function(section) {
    const sectionFolder = getOrCreateManagedChildFolder(
      bloggingRoot,
      section.label,
      'section.' + section.id,
      section.aliases || []
    );
    section.allowedTypes.forEach(function(contentType) {
      const typeFolder = getOrCreateManagedChildFolder(
        sectionFolder,
        BLOGGING_CONTENT_TYPES[contentType],
        'section.' + section.id + '.' + contentType,
        getContentTypeFolderAliases(contentType)
      );
      folders.push({
        section: section.id,
        sectionLabel: section.label,
        contentType: contentType,
        folderName: typeFolder.getName(),
        folderId: typeFolder.getId(),
        folderUrl: typeFolder.getUrl()
      });
    });
  });

  return {
    rootFolderId: bloggingRoot.getId(),
    rootFolderUrl: bloggingRoot.getUrl(),
    pendingFolderId: pendingFolder.getId(),
    pendingFolderUrl: pendingFolder.getUrl(),
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    folders: folders
  };
}

function initializeBloggingFoldersFromGet(e) {
  try {
    const result = initializeBloggingFolders({
      password: e.parameter.password
    });

    return createResponse({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    Logger.log('ERROR in initializeBloggingFoldersFromGet: ' + error.toString());
    return createResponse({
      success: false,
      message: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
}

function scanBloggingUploads(data) {
  if (!data || data.password !== ADMIN_PASSWORD) {
    throw new Error('Unauthorized: Invalid admin credentials');
  }

  const structure = initializeBloggingFolders();
  const pendingFolder = DriveApp.getFolderById(structure.pendingFolderId);
  const spreadsheet = getOrCreateBloggingSpreadsheet(DriveApp.getFolderById(structure.rootFolderId));
  const sheet = spreadsheet.getActiveSheet();
  const staleDeletedCount = cleanStaleBloggingContentRows(sheet);
  const existingFileIds = getExistingBloggingFileIds(sheet);
  const files = pendingFolder.getFiles();
  const created = [];
  let skipped = 0;

  while (files.hasNext()) {
    const file = files.next();
    const fileId = file.getId();

    if (existingFileIds[fileId]) {
      skipped++;
      continue;
    }

    const mimeType = file.getMimeType();
    const contentType = inferBloggingContentType(mimeType);
    const urls = getDriveMediaUrls(fileId);
    const now = new Date();
    const id = generateBloggingContentId();

    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    sheet.appendRow([
      id,
      now,
      fileId,
      file.getName(),
      mimeType,
      safeGetFileSize(file),
      contentType,
      '',
      'pending',
      stripFileExtension(file.getName()),
      '',
      urls.driveUrl,
      urls.previewUrl,
      urls.embedUrl,
      urls.downloadUrl,
      pendingFolder.getId(),
      pendingFolder.getUrl(),
      now
    ]);

    created.push({
      id: id,
      fileId: fileId,
      fileName: file.getName(),
      mimeType: mimeType,
      contentType: contentType,
      status: 'pending',
      folderId: pendingFolder.getId(),
      driveUrl: urls.driveUrl,
      previewUrl: urls.previewUrl,
      embedUrl: urls.embedUrl,
      downloadUrl: urls.downloadUrl,
      thumbnailUrl: urls.thumbnailUrl
    });
  }

  const driveSyncCount = syncBloggingContentFromDrive(structure, sheet, '', '');
  invalidateBloggingContentCache();

  return {
    created: created,
    createdCount: created.length,
    driveSyncCount: driveSyncCount,
    staleDeletedCount: staleDeletedCount,
    skippedCount: skipped,
    pendingFolderUrl: pendingFolder.getUrl()
  };
}

function scanBloggingUploadsFromGet(e) {
  try {
    const result = scanBloggingUploads({
      password: e.parameter.password
    });

    return createResponse({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    Logger.log('ERROR in scanBloggingUploadsFromGet: ' + error.toString());
    return createResponse({
      success: false,
      message: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
}

function scheduledBloggingDriveScan() {
  const structure = initializeBloggingFolders();
  const spreadsheet = getOrCreateBloggingSpreadsheet(DriveApp.getFolderById(structure.rootFolderId));
  const sheet = spreadsheet.getActiveSheet();
  const staleDeletedCount = cleanStaleBloggingContentRows(sheet);
  const created = syncBloggingContentFromDrive(structure, sheet, '', '');
  if (created > 0 || staleDeletedCount > 0) {
    invalidateBloggingContentCache();
  }
  Logger.log('Scheduled blogging drive scan completed. Created records: ' + created + '. Stale rows deleted: ' + staleDeletedCount);
  return {
    created: created,
    staleDeletedCount: staleDeletedCount
  };
}

function installBloggingDriveScanner() {
  const handler = 'scheduledBloggingDriveScan';
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === handler) {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger(handler)
    .timeBased()
    .everyMinutes(15)
    .create();

  return {
    installed: true,
    handler: handler,
    intervalMinutes: 15
  };
}

function installBloggingDriveScannerFromGet(e) {
  try {
    if (e.parameter.password !== ADMIN_PASSWORD) {
      throw new Error('Unauthorized: Invalid admin credentials');
    }

    const result = installBloggingDriveScanner();
    return createResponse({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    Logger.log('ERROR in installBloggingDriveScannerFromGet: ' + error.toString());
    return createResponse({
      success: false,
      message: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
}

function uploadBloggingContentBatch(data) {
  if (!data || data.password !== ADMIN_PASSWORD) {
    throw new Error('Unauthorized: Invalid admin credentials');
  }

  if (!data.files || !Array.isArray(data.files) || data.files.length === 0) {
    throw new Error('At least one file is required');
  }

  const structure = initializeBloggingFolders();
  const rootFolder = DriveApp.getFolderById(structure.rootFolderId);
  const pendingFolder = DriveApp.getFolderById(structure.pendingFolderId);
  const spreadsheet = getOrCreateBloggingSpreadsheet(rootFolder);
  const sheet = spreadsheet.getActiveSheet();
  const uploaded = [];

  data.files.forEach(function(fileData) {
    if (!fileData || !fileData.data || !fileData.name) {
      throw new Error('Invalid file payload');
    }

    const contentType = data.contentType || inferBloggingContentType(fileData.type || fileData.mimeType);
    const section = data.section || '';
    let targetFolder = pendingFolder;
    let status = 'pending';

    validateBloggingContentType(contentType);

    if (section) {
      validateBloggingSectionAndType(section, contentType);
      targetFolder = getBloggingTargetFolder(rootFolder, section, contentType);
      status = data.status || 'published';
    }

    const blob = Utilities.newBlob(
      Utilities.base64Decode(fileData.data),
      fileData.type || fileData.mimeType || MimeType.BINARY,
      fileData.name
    );
    const file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const now = new Date();
    const id = generateBloggingContentId();
    const urls = getDriveMediaUrls(file.getId());

    sheet.appendRow([
      id,
      now,
      file.getId(),
      file.getName(),
      file.getMimeType(),
      safeGetFileSize(file),
      contentType,
      section,
      status,
      stripFileExtension(file.getName()),
      data.description || '',
      urls.driveUrl,
      urls.previewUrl,
      urls.embedUrl,
      urls.downloadUrl,
      targetFolder.getId(),
      targetFolder.getUrl(),
      now
    ]);

    uploaded.push({
      id: id,
      fileId: file.getId(),
      fileName: file.getName(),
      contentType: contentType,
      section: section,
      status: status,
      driveUrl: urls.driveUrl,
      previewUrl: urls.previewUrl,
      embedUrl: urls.embedUrl,
      downloadUrl: urls.downloadUrl,
      thumbnailUrl: urls.thumbnailUrl,
      folderId: targetFolder.getId(),
      folderUrl: targetFolder.getUrl()
    });
  });
  invalidateBloggingContentCache();

  return {
    uploaded: uploaded,
    uploadedCount: uploaded.length
  };
}

function getBloggingContent(e) {
  try {
    const startedAt = new Date().getTime();
    const shouldSync = e.parameter.sync === 'true' || e.parameter.sync === '1';
    const manifestOnly = e.parameter.manifest === 'true' || e.parameter.manifest === '1';
    const requestedIds = String(e.parameter.ids || '').split(',').filter(function(id) {
      return Boolean(id);
    });
    const requestedIdSet = {};
    requestedIds.forEach(function(id) {
      requestedIdSet[id] = true;
    });
    const section = normalizeBloggingValue(e.parameter.section || '');
    const contentType = normalizeBloggingValue(e.parameter.contentType || e.parameter.type || '');
    const isAdminRequest = e.parameter.password === ADMIN_PASSWORD;
    const status = normalizeBloggingValue(e.parameter.status || (isAdminRequest ? '' : 'published'));
    const canUseCache = !shouldSync && !isAdminRequest && !manifestOnly && requestedIds.length === 0;
    const cacheKey = canUseCache ? getBloggingContentCacheKey(section, contentType, status) : '';
    const cachedPayload = canUseCache ? getCachedBloggingContentPayload(cacheKey) : null;

    if (cachedPayload) {
      cachedPayload.fromCache = true;
      cachedPayload.timestamp = new Date().toISOString();
      cachedPayload.durationMs = new Date().getTime() - startedAt;
      return createResponse(cachedPayload);
    }

    const structure = shouldSync ? initializeBloggingFolders() : null;
    let syncCreatedCount = 0;
    let sheetName = 'manifest';
    let manifestUpdatedAt = '';
    let rows = !shouldSync && !isAdminRequest ? getStoredBloggingManifestRows() : null;

    if (!rows) {
      const spreadsheet = shouldSync
        ? getOrCreateBloggingSpreadsheet(DriveApp.getFolderById(structure.rootFolderId))
        : getBloggingSpreadsheetForRead();
      const sheet = getBloggingContentSheet(spreadsheet);
      syncCreatedCount = shouldSync ? syncBloggingContentFromDrive(structure, sheet, section, contentType) : 0;
      rows = readBloggingRows(sheet);
      sheetName = sheet.getName();

      if (!shouldSync && !isAdminRequest && rows.length > 0) {
        setStoredBloggingManifestRows(rows);
        manifestUpdatedAt = PropertiesService.getScriptProperties().getProperty(BLOGGING_MANIFEST_UPDATED_PROPERTY) || '';
      }
    } else {
      manifestUpdatedAt = PropertiesService.getScriptProperties().getProperty(BLOGGING_MANIFEST_UPDATED_PROPERTY) || '';
    }

    const content = rows.filter(function(item) {
      if (requestedIds.length > 0 && !requestedIdSet[item.id]) return false;
      if (section && item.sectionKey !== section) return false;
      if (contentType && item.contentTypeKey !== contentType) return false;
      if (status && item.statusKey !== status) return false;
      return true;
    });

    content.sort(function(a, b) {
      return new Date(b.updatedAt || b.timestamp) - new Date(a.updatedAt || a.timestamp);
    });

    const responseContent = manifestOnly ? content.map(function(item) {
      return {
        id: item.id,
        revision: getBloggingContentRevision(item)
      };
    }) : content;

    const payload = {
      success: true,
      data: responseContent,
      count: responseContent.length,
      syncCreatedCount: syncCreatedCount,
      sync: shouldSync,
      sheetName: sheetName,
      totalRows: rows.length,
      manifest: Boolean(manifestUpdatedAt),
      manifestUpdatedAt: manifestUpdatedAt,
      durationMs: new Date().getTime() - startedAt,
      timestamp: new Date().toISOString()
    };

    if (canUseCache) {
      setCachedBloggingContentPayload(cacheKey, payload);
    }

    return createResponse(payload);
  } catch (error) {
    Logger.log('ERROR in getBloggingContent: ' + error.toString());
    return createResponse({
      success: false,
      message: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
}

function getBloggingContentRevision(item) {
  return [
    normalizeBloggingRevisionDate(item.updatedAt || item.timestamp),
    item.fileId || '',
    item.section || '',
    item.contentType || '',
    item.status || '',
    item.title || '',
    item.description || ''
  ].join('|');
}

function normalizeBloggingRevisionDate(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function syncBloggingContentFromDrive(structure, sheet, sectionId, contentType) {
  const existingFileIds = getExistingBloggingFileIds(sheet);
  const rootFolders = getAllBloggingRootFolders(structure);
  const sectionsToScan = sectionId ? [getBloggingSection(sectionId)] : BLOGGING_SECTIONS;
  let createdCount = 0;

  Logger.log('Blogging sync roots found: ' + rootFolders.length);

  rootFolders.forEach(function(rootFolder) {
    sectionsToScan.forEach(function(section) {
      const sectionFolders = findChildFoldersByNames(rootFolder, getSectionFolderNames(section));
      Logger.log('Blogging sync section "' + section.id + '" folders found in root "' + rootFolder.getName() + '": ' + sectionFolders.length);

      sectionFolders.forEach(function(sectionFolder) {
        const typesToScan = contentType ? [contentType] : section.allowedTypes;
        typesToScan.forEach(function(type) {
          if (section.allowedTypes.indexOf(type) === -1) return;

          const typeFolders = findChildFoldersByNames(sectionFolder, getContentTypeFolderNames(type));
          Logger.log('Blogging sync type "' + type + '" folders found in section "' + sectionFolder.getName() + '": ' + typeFolders.length);

          typeFolders.forEach(function(typeFolder) {
            createdCount += registerFilesFromFolder(sheet, typeFolder, {
              existingFileIds: existingFileIds,
              section: section.id,
              contentType: type,
              status: 'published'
            });
          });

          if (contentType) {
            createdCount += registerFilesFromFolder(sheet, sectionFolder, {
              existingFileIds: existingFileIds,
              section: section.id,
              contentType: type,
              status: 'published',
              onlyMatchingMimeType: true
            });
          }
        });
      });
    });
  });

  Logger.log('Blogging sync created records: ' + createdCount);
  return createdCount;
}

function registerFilesFromFolder(sheet, folder, options) {
  const files = folder.getFiles();
  let createdCount = 0;

  while (files.hasNext()) {
    const file = files.next();
    const fileId = file.getId();

    if (options.existingFileIds[fileId]) continue;

    if (options.onlyMatchingMimeType) {
      const inferredType = inferBloggingContentType(file.getMimeType());
      if (inferredType !== options.contentType) continue;
    }

    appendBloggingFileRecord(sheet, file, {
      section: options.section,
      contentType: options.contentType,
      status: options.status || 'published',
      folder: folder
    });
    options.existingFileIds[fileId] = true;
    createdCount++;
  }

  return createdCount;
}

function appendBloggingFileRecord(sheet, file, options) {
  const now = new Date();
  const urls = getDriveMediaUrls(file.getId());
  const folder = options.folder;

  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (error) {
    Logger.log('Could not update file sharing: ' + error.toString());
  }

  sheet.appendRow([
    generateBloggingContentId(),
    now,
    file.getId(),
    file.getName(),
    file.getMimeType(),
    safeGetFileSize(file),
    options.contentType,
    options.section || '',
    options.status || 'published',
    stripFileExtension(file.getName()),
    '',
    urls.driveUrl,
    urls.previewUrl,
    urls.embedUrl,
    urls.downloadUrl,
    folder.getId(),
    folder.getUrl(),
    now
  ]);
}

function getBloggingDebug(e) {
  try {
    if (e.parameter.password !== ADMIN_PASSWORD) {
      throw new Error('Unauthorized: Invalid admin credentials');
    }

    const structure = initializeBloggingFolders();
    const rootFolders = getAllBloggingRootFolders(structure);
    const spreadsheet = getOrCreateBloggingSpreadsheet(DriveApp.getFolderById(structure.rootFolderId));
    const sheet = spreadsheet.getActiveSheet();
    const rows = readBloggingRows(sheet);
    const roots = rootFolders.map(function(rootFolder) {
      return {
        id: rootFolder.getId(),
        name: rootFolder.getName(),
        url: rootFolder.getUrl(),
        sections: BLOGGING_SECTIONS.map(function(section) {
          const sectionFolders = findChildFoldersByNames(rootFolder, getSectionFolderNames(section));
          return {
            section: section.id,
            labels: getSectionFolderNames(section),
            folders: sectionFolders.map(function(sectionFolder) {
              return {
                id: sectionFolder.getId(),
                name: sectionFolder.getName(),
                url: sectionFolder.getUrl(),
                directFileCount: countFolderFiles(sectionFolder),
                types: section.allowedTypes.map(function(type) {
                  const typeFolders = findChildFoldersByNames(sectionFolder, getContentTypeFolderNames(type));
                  return {
                    type: type,
                    labels: getContentTypeFolderNames(type),
                    folders: typeFolders.map(function(typeFolder) {
                      return {
                        id: typeFolder.getId(),
                        name: typeFolder.getName(),
                        url: typeFolder.getUrl(),
                        fileCount: countFolderFiles(typeFolder)
                      };
                    })
                  };
                })
              };
            })
          };
        })
      };
    });

    return createResponse({
      success: true,
      data: {
        deployment: 'blogging-debug-v2',
        rootFolderId: structure.rootFolderId,
        spreadsheetId: structure.spreadsheetId,
        spreadsheetUrl: structure.spreadsheetUrl,
        sheetLastRow: sheet.getLastRow(),
        registeredRows: rows.length,
        roots: roots
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    Logger.log('ERROR in getBloggingDebug: ' + error.toString());
    return createResponse({
      success: false,
      message: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
}

function updateBloggingContentBatch(data) {
  if (!data || data.password !== ADMIN_PASSWORD) {
    throw new Error('Unauthorized: Invalid admin credentials');
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new Error('At least one item is required');
  }

  const structure = initializeBloggingFolders();
  const rootFolder = DriveApp.getFolderById(structure.rootFolderId);
  const spreadsheet = getOrCreateBloggingSpreadsheet(rootFolder);
  const sheet = spreadsheet.getActiveSheet();
  const values = sheet.getDataRange().getValues();
  const rowMap = {};

  for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
    rowMap[values[rowIndex][0]] = {
      rowNumber: rowIndex + 1,
      values: values[rowIndex]
    };
  }

  const updated = [];

  data.items.forEach(function(item) {
    const current = rowMap[item.id];
    if (!current) {
      throw new Error('Blogging content item not found: ' + item.id);
    }

    const row = current.values;
    const fileId = row[2];
    const contentType = item.contentType || row[6];
    const section = item.section || row[7];
    const status = item.status || (section ? 'published' : row[8] || 'pending');
    const title = item.title !== undefined ? item.title : row[9];
    const description = item.description !== undefined ? item.description : row[10];
    const file = DriveApp.getFileById(fileId);
    let targetFolderId = row[15];
    let targetFolderUrl = row[16];

    validateBloggingContentType(contentType);

    if (section) {
      validateBloggingSectionAndType(section, contentType);
      const targetFolder = getBloggingTargetFolder(rootFolder, section, contentType);
      targetFolderId = targetFolder.getId();
      targetFolderUrl = targetFolder.getUrl();

      if (data.moveFiles !== false) {
        moveFileToBloggingFolder(file, targetFolder, row[15], structure.pendingFolderId);
      }
    }

    const urls = getDriveMediaUrls(fileId);
    const now = new Date();

    sheet.getRange(current.rowNumber, 7, 1, 12).setValues([[
      contentType,
      section,
      status,
      title,
      description,
      urls.driveUrl,
      urls.previewUrl,
      urls.embedUrl,
      urls.downloadUrl,
      targetFolderId,
      targetFolderUrl,
      now
    ]]);

    updated.push({
      id: item.id,
      fileId: fileId,
      fileName: row[3],
      contentType: contentType,
      section: section,
      status: status,
      title: title,
      description: description,
      driveUrl: urls.driveUrl,
      previewUrl: urls.previewUrl,
      embedUrl: urls.embedUrl,
      downloadUrl: urls.downloadUrl,
      thumbnailUrl: urls.thumbnailUrl,
      folderId: targetFolderId,
      folderUrl: targetFolderUrl,
      updatedAt: now
    });
  });

  invalidateBloggingContentCache();

  return {
    updated: updated,
    updatedCount: updated.length
  };
}

function deleteBloggingContentBatch(data) {
  if (!data || data.password !== ADMIN_PASSWORD) {
    throw new Error('Unauthorized: Invalid admin credentials');
  }

  if (!data.ids || !Array.isArray(data.ids) || data.ids.length === 0) {
    throw new Error('At least one item id is required');
  }

  const structure = initializeBloggingFolders();
  const rootFolder = DriveApp.getFolderById(structure.rootFolderId);
  const spreadsheet = getOrCreateBloggingSpreadsheet(rootFolder);
  const sheet = spreadsheet.getActiveSheet();
  const values = sheet.getDataRange().getValues();
  const idSet = {};
  const rowsToDelete = [];
  const deleted = [];
  const errors = [];

  data.ids.forEach(function(id) {
    idSet[id] = true;
  });

  for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
    const id = values[rowIndex][0];
    if (!idSet[id]) continue;

    const fileId = values[rowIndex][2];
    try {
      DriveApp.getFileById(fileId).setTrashed(true);
      deleted.push({
        id: id,
        fileId: fileId
      });
    } catch (error) {
      errors.push({
        id: id,
        fileId: fileId,
        message: error.toString()
      });
    }

    rowsToDelete.push(rowIndex + 1);
  }

  rowsToDelete.sort(function(a, b) {
    return b - a;
  }).forEach(function(rowNumber) {
    sheet.deleteRow(rowNumber);
  });

  invalidateBloggingContentCache();

  return {
    deleted: deleted,
    deletedCount: deleted.length,
    errors: errors
  };
}

function getOrCreateBloggingSpreadsheet(folder) {
  if (BLOGGING_SPREADSHEET_ID) {
    const spreadsheet = SpreadsheetApp.openById(BLOGGING_SPREADSHEET_ID);
    ensureBloggingHeaders(spreadsheet.getActiveSheet());
    setBloggingSpreadsheetId(spreadsheet.getId());
    return spreadsheet;
  }

  const cachedSpreadsheet = getCachedBloggingSpreadsheet();
  const candidates = findBloggingSpreadsheetCandidates(folder);
  if (cachedSpreadsheet) {
    candidates.push(cachedSpreadsheet);
  }

  if (candidates.length > 0) {
    const spreadsheet = chooseBestBloggingSpreadsheet(candidates);
    ensureBloggingHeaders(spreadsheet.getActiveSheet());
    setBloggingSpreadsheetId(spreadsheet.getId());
    return spreadsheet;
  }

  if (!folder) {
    const baseFolder = DriveApp.getFolderById(FOLDER_ID);
    folder = getOrCreateManagedChildFolder(
      baseFolder,
      BLOGGING_ROOT_FOLDER_NAME,
      'root',
      ['videos blogging M', 'Videos blogging M']
    );
  }

  const spreadsheet = SpreadsheetApp.create(BLOGGING_SPREADSHEET_NAME);
  const sheet = spreadsheet.getActiveSheet();
  ensureBloggingHeaders(sheet);

  const spreadsheetFile = DriveApp.getFileById(spreadsheet.getId());
  folder.addFile(spreadsheetFile);
  DriveApp.getRootFolder().removeFile(spreadsheetFile);

  setBloggingSpreadsheetId(spreadsheet.getId());
  return spreadsheet;
}

function getCachedBloggingSpreadsheet() {
  if (BLOGGING_SPREADSHEET_ID) {
    try {
      return SpreadsheetApp.openById(BLOGGING_SPREADSHEET_ID);
    } catch (error) {
      Logger.log('Configured blogging spreadsheet missing: ' + error.toString());
    }
  }

  const spreadsheetId = PropertiesService.getScriptProperties().getProperty(BLOGGING_SPREADSHEET_PROPERTY);
  if (!spreadsheetId) return null;

  try {
    return SpreadsheetApp.openById(spreadsheetId);
  } catch (error) {
    Logger.log('Cached blogging spreadsheet missing: ' + error.toString());
    PropertiesService.getScriptProperties().deleteProperty(BLOGGING_SPREADSHEET_PROPERTY);
    return null;
  }
}

function getBloggingSpreadsheetForRead() {
  const spreadsheet = getCachedBloggingSpreadsheet();
  if (spreadsheet) return spreadsheet;
  return getOrCreateBloggingSpreadsheet(null);
}

function getBloggingContentCacheKey(section, contentType, status) {
  return [
    'bloggingContent',
    getBloggingContentCacheVersion(),
    section || 'all',
    contentType || 'all',
    status || 'all'
  ].join(':').replace(/[^a-zA-Z0-9:_-]/g, '_');
}

function getBloggingContentCacheVersion() {
  return PropertiesService.getScriptProperties().getProperty(BLOGGING_CONTENT_CACHE_VERSION_PROPERTY) || '1';
}

function getCachedBloggingContentPayload(cacheKey) {
  try {
    const cached = CacheService.getScriptCache().get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    Logger.log('Could not read blogging content cache: ' + error.toString());
    return null;
  }
}

function setCachedBloggingContentPayload(cacheKey, payload) {
  try {
    const ttl = payload && payload.count === 0 ? BLOGGING_EMPTY_CONTENT_CACHE_TTL_SECONDS : BLOGGING_CONTENT_CACHE_TTL_SECONDS;
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(payload), ttl);
  } catch (error) {
    Logger.log('Could not write blogging content cache: ' + error.toString());
  }
}

function invalidateBloggingContentCache() {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty(BLOGGING_CONTENT_CACHE_VERSION_PROPERTY, String(new Date().getTime()));
  clearStoredBloggingManifestRows(properties);
}

function getStoredBloggingManifestRows() {
  try {
    const properties = PropertiesService.getScriptProperties();
    const chunkCount = Number(properties.getProperty(BLOGGING_MANIFEST_CHUNK_COUNT_PROPERTY) || 0);
    if (!chunkCount) return null;

    let json = '';
    for (let index = 0; index < chunkCount; index++) {
      const chunk = properties.getProperty(BLOGGING_MANIFEST_PROPERTY_PREFIX + index);
      if (chunk === null || chunk === undefined) return null;
      json += chunk;
    }

    const rows = JSON.parse(json);
    return Array.isArray(rows) ? rows : null;
  } catch (error) {
    Logger.log('Could not read blogging manifest: ' + error.toString());
    return null;
  }
}

function setStoredBloggingManifestRows(rows) {
  try {
    const properties = PropertiesService.getScriptProperties();
    clearStoredBloggingManifestRows(properties);

    const json = JSON.stringify(rows);
    const chunkCount = Math.ceil(json.length / BLOGGING_MANIFEST_CHUNK_SIZE);

    for (let index = 0; index < chunkCount; index++) {
      properties.setProperty(
        BLOGGING_MANIFEST_PROPERTY_PREFIX + index,
        json.slice(index * BLOGGING_MANIFEST_CHUNK_SIZE, (index + 1) * BLOGGING_MANIFEST_CHUNK_SIZE)
      );
    }

    properties.setProperty(BLOGGING_MANIFEST_CHUNK_COUNT_PROPERTY, String(chunkCount));
    properties.setProperty(BLOGGING_MANIFEST_UPDATED_PROPERTY, new Date().toISOString());
  } catch (error) {
    Logger.log('Could not write blogging manifest: ' + error.toString());
  }
}

function clearStoredBloggingManifestRows(properties) {
  properties = properties || PropertiesService.getScriptProperties();
  const chunkCount = Number(properties.getProperty(BLOGGING_MANIFEST_CHUNK_COUNT_PROPERTY) || 0);

  for (let index = 0; index < chunkCount; index++) {
    properties.deleteProperty(BLOGGING_MANIFEST_PROPERTY_PREFIX + index);
  }

  properties.deleteProperty(BLOGGING_MANIFEST_CHUNK_COUNT_PROPERTY);
  properties.deleteProperty(BLOGGING_MANIFEST_UPDATED_PROPERTY);
}

function setBloggingSpreadsheetId(spreadsheetId) {
  PropertiesService.getScriptProperties().setProperty(BLOGGING_SPREADSHEET_PROPERTY, spreadsheetId);
}

function findBloggingSpreadsheetCandidates(primaryFolder) {
  const byId = {};
  const folders = [];

  if (primaryFolder) folders.push(primaryFolder);

  try {
    const structureRoot = getManagedFolder('root');
    if (structureRoot) folders.push(structureRoot);
  } catch (error) {
    Logger.log('Could not read managed root for spreadsheet candidates: ' + error.toString());
  }

  try {
    getAllBloggingRootFolders(null).forEach(function(folder) {
      folders.push(folder);
    });
  } catch (error) {
    Logger.log('Could not read all root folders for spreadsheet candidates: ' + error.toString());
  }

  folders.forEach(function(folder) {
    try {
      const files = folder.getFilesByName(BLOGGING_SPREADSHEET_NAME);
      while (files.hasNext()) {
        const file = files.next();
        byId[file.getId()] = SpreadsheetApp.openById(file.getId());
      }
    } catch (error) {
      Logger.log('Could not inspect folder for spreadsheet candidates: ' + error.toString());
    }
  });

  return Object.keys(byId).map(function(id) {
    return byId[id];
  });
}

function chooseBestBloggingSpreadsheet(spreadsheets) {
  spreadsheets.sort(function(a, b) {
    const rowDiff = b.getActiveSheet().getLastRow() - a.getActiveSheet().getLastRow();
    if (rowDiff !== 0) return rowDiff;
    return a.getName().localeCompare(b.getName());
  });

  return spreadsheets[0];
}

function ensureBloggingHeaders(sheet) {
  const headers = [
    'ID',
    'Timestamp',
    'File ID',
    'File Name',
    'Mime Type',
    'Size Bytes',
    'Content Type',
    'Section',
    'Status',
    'Title',
    'Description',
    'Drive URL',
    'Preview URL',
    'Embed URL',
    'Download URL',
    'Folder ID',
    'Folder URL',
    'Updated At'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  const width = Math.max(sheet.getLastColumn(), headers.length);
  const currentHeaders = sheet.getRange(1, 1, 1, width).getValues()[0];

  headers.forEach(function(header, index) {
    if (currentHeaders[index] !== header) {
      sheet.getRange(1, index + 1).setValue(header);
    }
  });

  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#14532d');
  headerRange.setFontColor('#ffffff');
  sheet.setFrozenRows(1);
}

function getBloggingContentSheet(spreadsheet) {
  const expectedHeaders = ['ID', 'File ID', 'Content Type', 'Section', 'Status'];
  const sheets = spreadsheet.getSheets();
  let fallbackSheet = spreadsheet.getActiveSheet();

  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    const lastColumn = Math.max(sheet.getLastColumn(), 18);
    if (sheet.getLastRow() < 1 || lastColumn < 9) continue;

    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(header) {
      return String(header || '').trim();
    });

    const hasExpectedHeaders = expectedHeaders.every(function(header) {
      return headers.indexOf(header) !== -1;
    });

    if (hasExpectedHeaders) {
      return sheet;
    }
  }

  Logger.log('Blogging sheet with expected headers was not found. Falling back to active sheet: ' + fallbackSheet.getName());
  return fallbackSheet;
}

function readBloggingRows(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, 18).getValues();

  return values
    .map(function(row) {
      const statusKey = normalizeBloggingStatus(row[8]);
      const sectionKey = normalizeBloggingValue(row[7]);
      const contentTypeKey = normalizeBloggingValue(row[6]);

      return {
        id: row[0],
        timestamp: row[1],
        fileId: row[2],
        fileName: row[3],
        mimeType: row[4],
        sizeBytes: row[5],
        contentType: row[6],
        contentTypeKey: contentTypeKey,
        section: row[7],
        sectionKey: sectionKey,
        status: row[8],
        statusKey: statusKey,
        title: row[9],
        description: row[10],
        driveUrl: row[11],
        previewUrl: row[12],
        embedUrl: row[13],
        downloadUrl: row[14],
        thumbnailUrl: getDriveThumbnailUrl(row[2]),
        folderId: row[15],
        folderUrl: row[16],
        updatedAt: row[17]
      };
    })
    .filter(function(item) {
      return item.id && item.fileId;
    });
}

function normalizeBloggingValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function normalizeBloggingStatus(value) {
  const status = normalizeBloggingValue(value);
  return status || 'published';
}

function cleanStaleBloggingContentRows(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 0;

  const values = sheet.getRange(2, 1, lastRow - 1, 18).getValues();
  const rowsToDelete = [];

  values.forEach(function(row, index) {
    const fileId = row[2];
    if (!fileId) {
      rowsToDelete.push(index + 2);
      return;
    }

    try {
      const file = DriveApp.getFileById(fileId);
      if (file.isTrashed()) {
        rowsToDelete.push(index + 2);
      }
    } catch (error) {
      rowsToDelete.push(index + 2);
    }
  });

  rowsToDelete.sort(function(a, b) {
    return b - a;
  }).forEach(function(rowNumber) {
    sheet.deleteRow(rowNumber);
  });

  return rowsToDelete.length;
}

function getExistingBloggingFileIds(sheet) {
  const rows = readBloggingRows(sheet);
  const existing = {};
  rows.forEach(function(row) {
    existing[row.fileId] = true;
  });
  return existing;
}

function consolidateBloggingFolders(data) {
  if (!data || data.password !== ADMIN_PASSWORD) {
    throw new Error('Unauthorized: Invalid admin credentials');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const baseFolder = DriveApp.getFolderById(FOLDER_ID);
    const rootFolders = findChildFoldersByNames(baseFolder, [
      BLOGGING_ROOT_FOLDER_NAME,
      'videos blogging M',
      'Videos blogging M'
    ]);
    const rootFolder = chooseCanonicalFolder(rootFolders);
    const summary = {
      rootDuplicatesFound: Math.max(0, rootFolders.length - 1),
      sectionDuplicatesMerged: 0,
      typeDuplicatesMerged: 0,
      filesMoved: 0,
      foldersTrashed: 0
    };

    if (!rootFolder) {
      const initialized = buildBloggingFolderStructure();
      return {
        ...summary,
        message: 'No blogging folder existed. A new structure was created.',
        rootFolderUrl: initialized.rootFolderUrl
      };
    }

    setManagedFolderId('root', rootFolder.getId());

    rootFolders.forEach(function(folder) {
      if (folder.getId() !== rootFolder.getId()) {
        const result = mergeFolderContents(folder, rootFolder);
        summary.filesMoved += result.filesMoved;
        summary.foldersTrashed += result.foldersTrashed + trashFolder(folder);
      }
    });

    const pendingResult = consolidateNamedFolders(rootFolder, BLOGGING_PENDING_FOLDER_NAME, ['Pending Review', 'Pending Uploads']);
    summary.filesMoved += pendingResult.filesMoved;
    summary.foldersTrashed += pendingResult.foldersTrashed;
    setManagedFolderId('pending', pendingResult.folder.getId());

    BLOGGING_SECTIONS.forEach(function(section) {
      const sectionNames = [section.label].concat(section.aliases || []);
      const sectionResult = consolidateNamedFolders(rootFolder, section.label, sectionNames.slice(1));
      summary.sectionDuplicatesMerged += sectionResult.duplicatesMerged;
      summary.filesMoved += sectionResult.filesMoved;
      summary.foldersTrashed += sectionResult.foldersTrashed;
      setManagedFolderId('section.' + section.id, sectionResult.folder.getId());

      section.allowedTypes.forEach(function(contentType) {
        const typeResult = consolidateNamedFolders(
          sectionResult.folder,
          BLOGGING_CONTENT_TYPES[contentType],
          getContentTypeFolderAliases(contentType)
        );
        summary.typeDuplicatesMerged += typeResult.duplicatesMerged;
        summary.filesMoved += typeResult.filesMoved;
        summary.foldersTrashed += typeResult.foldersTrashed;
        setManagedFolderId('section.' + section.id + '.' + contentType, typeResult.folder.getId());
      });
    });

    const structure = buildBloggingFolderStructure();
    return {
      ...summary,
      rootFolderUrl: structure.rootFolderUrl,
      pendingFolderUrl: structure.pendingFolderUrl
    };
  } finally {
    lock.releaseLock();
  }
}

function consolidateBloggingFoldersFromGet(e) {
  try {
    const result = consolidateBloggingFolders({
      password: e.parameter.password
    });

    return createResponse({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    Logger.log('ERROR in consolidateBloggingFoldersFromGet: ' + error.toString());
    return createResponse({
      success: false,
      message: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
}

function consolidateNamedFolders(parentFolder, canonicalName, aliases) {
  const folders = findChildFoldersByNames(parentFolder, [canonicalName].concat(aliases || []));
  let canonicalFolder = chooseCanonicalFolder(folders);
  const summary = {
    folder: canonicalFolder,
    duplicatesMerged: 0,
    filesMoved: 0,
    foldersTrashed: 0
  };

  if (!canonicalFolder) {
    canonicalFolder = parentFolder.createFolder(canonicalName);
    summary.folder = canonicalFolder;
    return summary;
  }

  folders.forEach(function(folder) {
    if (folder.getId() === canonicalFolder.getId()) return;
    const result = mergeFolderContents(folder, canonicalFolder);
    summary.duplicatesMerged++;
    summary.filesMoved += result.filesMoved;
    summary.foldersTrashed += result.foldersTrashed + trashFolder(folder);
  });

  return summary;
}

function mergeFolderContents(sourceFolder, targetFolder) {
  const summary = {
    filesMoved: 0,
    foldersTrashed: 0
  };
  const files = sourceFolder.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    targetFolder.addFile(file);
    try {
      sourceFolder.removeFile(file);
    } catch (error) {
      Logger.log('Could not remove moved file from source: ' + error.toString());
    }
    summary.filesMoved++;
  }

  const childFolders = sourceFolder.getFolders();
  while (childFolders.hasNext()) {
    const childFolder = childFolders.next();
    const targetChild = getOrCreateChildFolder(targetFolder, childFolder.getName());
    const result = mergeFolderContents(childFolder, targetChild);
    summary.filesMoved += result.filesMoved;
    summary.foldersTrashed += result.foldersTrashed + trashFolder(childFolder);
  }

  return summary;
}

function trashFolder(folder) {
  try {
    folder.setTrashed(true);
    return 1;
  } catch (error) {
    Logger.log('Could not trash folder ' + folder.getName() + ': ' + error.toString());
    return 0;
  }
}

function getOrCreateManagedChildFolder(parentFolder, folderName, propertyKey, aliases) {
  const cachedFolder = getManagedFolder(propertyKey, parentFolder);
  if (cachedFolder) {
    return cachedFolder;
  }

  const folders = findChildFoldersByNames(parentFolder, [folderName].concat(aliases || []));
  const folder = chooseCanonicalFolder(folders) || parentFolder.createFolder(folderName);
  setManagedFolderId(propertyKey, folder.getId());
  return folder;
}

function getManagedFolder(propertyKey, expectedParentFolder) {
  const folderId = PropertiesService.getScriptProperties().getProperty(BLOGGING_FOLDER_PROPERTY_PREFIX + propertyKey);
  if (!folderId) return null;

  try {
    const folder = DriveApp.getFolderById(folderId);
    if (!folder.isTrashed() && (!expectedParentFolder || folderHasParent(folder, expectedParentFolder))) return folder;
  } catch (error) {
    Logger.log('Cached folder missing for ' + propertyKey + ': ' + error.toString());
  }

  PropertiesService.getScriptProperties().deleteProperty(BLOGGING_FOLDER_PROPERTY_PREFIX + propertyKey);
  return null;
}

function folderHasParent(folder, expectedParentFolder) {
  const parents = folder.getParents();
  while (parents.hasNext()) {
    if (parents.next().getId() === expectedParentFolder.getId()) {
      return true;
    }
  }
  return false;
}

function setManagedFolderId(propertyKey, folderId) {
  PropertiesService.getScriptProperties().setProperty(BLOGGING_FOLDER_PROPERTY_PREFIX + propertyKey, folderId);
}

function findChildFoldersByNames(parentFolder, folderNames) {
  const normalizedTargets = {};
  folderNames.forEach(function(name) {
    normalizedTargets[normalizeFolderName(name)] = true;
  });

  const folders = parentFolder.getFolders();
  const matches = [];

  while (folders.hasNext()) {
    const folder = folders.next();
    if (!folder.isTrashed() && normalizedTargets[normalizeFolderName(folder.getName())]) {
      matches.push(folder);
    }
  }

  return matches;
}

function getAllBloggingRootFolders(structure) {
  const baseFolder = DriveApp.getFolderById(FOLDER_ID);
  const rootFolders = findChildFoldersByNames(baseFolder, [
    BLOGGING_ROOT_FOLDER_NAME,
    'videos blogging M',
    'Videos blogging M'
  ]);
  const byId = {};

  if (structure && structure.rootFolderId) {
    try {
      const folder = DriveApp.getFolderById(structure.rootFolderId);
      if (!folder.isTrashed()) {
        byId[folder.getId()] = folder;
      }
    } catch (error) {
      Logger.log('Could not read structure root folder: ' + error.toString());
    }
  }

  rootFolders.forEach(function(folder) {
    byId[folder.getId()] = folder;
  });

  return Object.keys(byId).map(function(id) {
    return byId[id];
  });
}

function getSectionFolderNames(section) {
  return [section.label].concat(section.aliases || []);
}

function getContentTypeFolderNames(contentType) {
  return [BLOGGING_CONTENT_TYPES[contentType]].concat(getContentTypeFolderAliases(contentType));
}

function countFolderFiles(folder) {
  const files = folder.getFiles();
  let count = 0;
  while (files.hasNext()) {
    files.next();
    count++;
  }
  return count;
}

function chooseCanonicalFolder(folders) {
  if (!folders || folders.length === 0) return null;

  folders.sort(function(a, b) {
    try {
      return a.getDateCreated() - b.getDateCreated();
    } catch (error) {
      return a.getName().localeCompare(b.getName());
    }
  });

  return folders[0];
}

function normalizeFolderName(name) {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function getContentTypeFolderAliases(contentType) {
  const aliases = {
    photo: ['Photo', 'photos'],
    miniblog: ['Mini Blog', 'Mini Blog', 'Mini Vlogs', 'Mini Vlog', 'mini vlogs', 'mini blogs'],
    roleplay: ['Role Plays', 'Role Play', 'role plays', 'roleplays'],
    video: ['Video', 'videos']
  };
  return aliases[contentType] || [];
}

function getOrCreateChildFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

function getBloggingTargetFolder(rootFolder, sectionId, contentType) {
  const section = getBloggingSection(sectionId);
  const sectionFolder = getOrCreateManagedChildFolder(
    rootFolder,
    section.label,
    'section.' + section.id,
    section.aliases || []
  );
  return getOrCreateManagedChildFolder(
    sectionFolder,
    BLOGGING_CONTENT_TYPES[contentType],
    'section.' + section.id + '.' + contentType,
    getContentTypeFolderAliases(contentType)
  );
}

function getBloggingSection(sectionId) {
  for (let i = 0; i < BLOGGING_SECTIONS.length; i++) {
    if (BLOGGING_SECTIONS[i].id === sectionId) {
      return BLOGGING_SECTIONS[i];
    }
  }
  throw new Error('Invalid blogging section: ' + sectionId);
}

function validateBloggingContentType(contentType) {
  if (!BLOGGING_CONTENT_TYPES[contentType]) {
    throw new Error('Invalid content type: ' + contentType);
  }
}

function validateBloggingSectionAndType(sectionId, contentType) {
  const section = getBloggingSection(sectionId);
  if (section.allowedTypes.indexOf(contentType) === -1) {
    throw new Error('Content type "' + contentType + '" is not allowed in section "' + sectionId + '"');
  }
}

function inferBloggingContentType(mimeType) {
  if (!mimeType) return 'video';
  if (mimeType.indexOf('image/') === 0) return 'photo';
  if (mimeType.indexOf('video/') === 0) return 'video';
  if (mimeType === MimeType.GOOGLE_DOCS || mimeType.indexOf('text/') === 0 || mimeType.indexOf('application/pdf') === 0) {
    return 'miniblog';
  }
  return 'video';
}

function moveFileToBloggingFolder(file, targetFolder, currentFolderId, pendingFolderId) {
  targetFolder.addFile(file);

  const foldersToRemove = {};
  if (currentFolderId && currentFolderId !== targetFolder.getId()) {
    foldersToRemove[currentFolderId] = true;
  }
  if (pendingFolderId && pendingFolderId !== targetFolder.getId()) {
    foldersToRemove[pendingFolderId] = true;
  }

  Object.keys(foldersToRemove).forEach(function(folderId) {
    try {
      DriveApp.getFolderById(folderId).removeFile(file);
    } catch (error) {
      Logger.log('Could not remove file from folder ' + folderId + ': ' + error.toString());
    }
  });
}

function getDriveMediaUrls(fileId) {
  return {
    driveUrl: 'https://drive.google.com/file/d/' + fileId + '/view',
    previewUrl: 'https://drive.google.com/file/d/' + fileId + '/preview',
    embedUrl: 'https://drive.google.com/file/d/' + fileId + '/preview',
    downloadUrl: 'https://drive.google.com/uc?export=download&id=' + fileId,
    thumbnailUrl: getDriveThumbnailUrl(fileId)
  };
}

function getDriveThumbnailUrl(fileId) {
  return 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w640';
}

function safeGetFileSize(file) {
  try {
    return file.getSize();
  } catch (error) {
    return '';
  }
}

function stripFileExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, '');
}

function generateBloggingContentId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return 'BLOG-' + timestamp + '-' + random;
}

function generateUniqueId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return 'EXP-' + timestamp + '-' + random;
}

// ========================================
// FUNCIÓN DE PRUEBA
// ========================================

function testDriveAccess() {
  try {
    Logger.log('=== TESTING DRIVE ACCESS ===');

    const folder = DriveApp.getFolderById(FOLDER_ID);
    Logger.log('✅ Folder access: ' + folder.getName());

    const testFolderName = 'TEST - ' + new Date().getTime();
    const testFolder = folder.createFolder(testFolderName);
    Logger.log('✅ Test folder created');

    const testFile = testFolder.createFile('test.txt', 'Test file at ' + new Date());
    Logger.log('✅ Test file created');

    const spreadsheet = getOrCreateSpreadsheet(folder);
    Logger.log('✅ Spreadsheet access OK');

    const testId = generateUniqueId();
    const sheet = spreadsheet.getActiveSheet();
    sheet.appendRow([
      testId,
      new Date(),
      'Test Student',
      'Test experience',
      '',
      '',
      testFolder.getUrl(),
      'test doc',
      testFolder.getId()
    ]);
    Logger.log('✅ Test row added');

    Logger.log('🎉 ALL TESTS PASSED');

    return {
      success: true,
      folderName: folder.getName(),
      testId: testId
    };

  } catch (error) {
    Logger.log('❌ Test failed: ' + error.toString());
    throw error;
  }
}

// ========================================
// SISTEMA DE COMENTARIOS - WRAPPER PARA GET
// ========================================

// Enviar comentario por GET (para evitar CORS)
function submitCommentFromGet(e) {
  try {
    const data = {
      publicationId: e.parameter.publicationId,
      name: e.parameter.name,
      comment: e.parameter.comment
    };
    
    const result = submitComment(data);
    
    return createResponse({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    Logger.log('❌ ERROR in submitCommentFromGet: ' + error.toString());
    return createResponse({
      success: false,
      message: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
}

// Eliminar comentario por GET (para evitar CORS)
function deleteCommentFromGet(e) {
  try {
    const data = {
      publicationId: e.parameter.publicationId,
      commentId: e.parameter.commentId,
      password: e.parameter.password
    };
    
    const result = deleteComment(data);
    
    return createResponse({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    Logger.log('❌ ERROR in deleteCommentFromGet: ' + error.toString());
    return createResponse({
      success: false,
      message: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
}

// Eliminar experiencia por GET (para evitar CORS)
function deleteExperienciaFromGet(e) {
  try {
    const data = {
      id: e.parameter.id,
      password: e.parameter.password
    };
    
    const result = deleteExperiencia(data);
    
    return createResponse({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    Logger.log('❌ ERROR in deleteExperienciaFromGet: ' + error.toString());
    return createResponse({
      success: false,
      message: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
}

// ========================================
// SISTEMA DE COMENTARIOS
// ========================================

// Validar contraseña de admin
function validateAdmin(e) {
  try {
    const password = e.parameter.password;
    
    return createResponse({
      success: true,
      data: {
        valid: password === ADMIN_PASSWORD
      }
    });
  } catch (error) {
    Logger.log('❌ ERROR in validateAdmin: ' + error.toString());
    return createResponse({
      success: false,
      message: error.toString()
    });
  }
}

// Obtener comentarios de una publicación
function getComments(e) {
  try {
    Logger.log('💬 Getting comments for publication');
    
    const publicationId = e.parameter.publicationId;
    
    if (!publicationId) {
      throw new Error('Publication ID is required');
    }
    
    Logger.log('📍 Publication ID: ' + publicationId);
    
    // Obtener la carpeta del estudiante
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const spreadsheet = getOrCreateSpreadsheet(folder);
    const sheet = spreadsheet.getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Buscar el folderId de esta publicación
    let folderId = null;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === publicationId) {
        folderId = data[i][8]; // Columna I (Folder ID)
        break;
      }
    }
    
    if (!folderId) {
      Logger.log('⚠️ Publication not found');
      return createResponse({
        success: true,
        data: {
          comments: []
        }
      });
    }
    
    Logger.log('📁 Found folder ID: ' + folderId);
    
    // Buscar carpeta de comentarios
    const studentFolder = DriveApp.getFolderById(folderId);
    const commentsFolders = studentFolder.getFoldersByName('comments');
    
    if (!commentsFolders.hasNext()) {
      Logger.log('📝 No comments folder exists yet');
      return createResponse({
        success: true,
        data: {
          comments: []
        }
      });
    }
    
    const commentsFolder = commentsFolders.next();
    const commentsFiles = commentsFolder.getFilesByName('comments.json');
    
    if (!commentsFiles.hasNext()) {
      Logger.log('📝 No comments file exists yet');
      return createResponse({
        success: true,
        data: {
          comments: []
        }
      });
    }
    
    // Leer archivo de comentarios
    const commentsFile = commentsFiles.next();
    const commentsContent = commentsFile.getBlob().getDataAsString();
    const comments = JSON.parse(commentsContent);
    
    Logger.log('✅ Found ' + comments.length + ' comments');
    
    return createResponse({
      success: true,
      data: {
        comments: comments
      }
    });
    
  } catch (error) {
    Logger.log('❌ ERROR in getComments: ' + error.toString());
    return createResponse({
      success: false,
      message: error.toString()
    });
  }
}

// Guardar nuevo comentario
function submitComment(data) {
  try {
    Logger.log('💬 Submitting new comment');
    
    const publicationId = data.publicationId;
    const name = data.name;
    const comment = data.comment;
    
    if (!publicationId || !name || !comment) {
      throw new Error('Missing required fields');
    }
    
    // Validar longitud del comentario (máximo 500 caracteres)
    if (comment.length > 500) {
      throw new Error('Comment is too long (max 500 characters)');
    }
    
    Logger.log('📍 Publication ID: ' + publicationId);
    Logger.log('👤 Name: ' + name);
    Logger.log('💬 Comment length: ' + comment.length);
    
    // Obtener la carpeta del estudiante
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const spreadsheet = getOrCreateSpreadsheet(folder);
    const sheet = spreadsheet.getActiveSheet();
    const sheetData = sheet.getDataRange().getValues();
    
    // Buscar el folderId de esta publicación
    let folderId = null;
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === publicationId) {
        folderId = sheetData[i][8]; // Columna I (Folder ID)
        break;
      }
    }
    
    if (!folderId) {
      throw new Error('Publication not found');
    }
    
    Logger.log('📁 Found folder ID: ' + folderId);
    
    const studentFolder = DriveApp.getFolderById(folderId);
    
    // Crear carpeta de comentarios si no existe
    let commentsFolder;
    const commentsFolders = studentFolder.getFoldersByName('comments');
    
    if (commentsFolders.hasNext()) {
      commentsFolder = commentsFolders.next();
      Logger.log('📁 Using existing comments folder');
    } else {
      commentsFolder = studentFolder.createFolder('comments');
      Logger.log('📁 Created new comments folder');
    }
    
    // Leer comentarios existentes o crear array vacío
    let comments = [];
    const commentsFiles = commentsFolder.getFilesByName('comments.json');
    let commentsFile = null;
    
    if (commentsFiles.hasNext()) {
      commentsFile = commentsFiles.next();
      const commentsContent = commentsFile.getBlob().getDataAsString();
      comments = JSON.parse(commentsContent);
      Logger.log('📖 Loaded ' + comments.length + ' existing comments');
    }
    
    // Crear nuevo comentario
    const newComment = {
      id: 'COMMENT-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000),
      name: name,
      comment: comment,
      timestamp: new Date().toISOString()
    };
    
    comments.push(newComment);
    Logger.log('✅ Added new comment with ID: ' + newComment.id);
    
    // Guardar comentarios actualizados
    const commentsJson = JSON.stringify(comments, null, 2);
    
    if (commentsFile) {
      commentsFile.setContent(commentsJson);
      Logger.log('💾 Updated existing comments file');
    } else {
      commentsFile = commentsFolder.createFile('comments.json', commentsJson, MimeType.PLAIN_TEXT);
      Logger.log('💾 Created new comments file');
    }
    
    return {
      success: true,
      comment: newComment,
      totalComments: comments.length
    };
    
  } catch (error) {
    Logger.log('❌ ERROR in submitComment: ' + error.toString());
    throw error;
  }
}

// Eliminar comentario (solo admin)
function deleteComment(data) {
  try {
    Logger.log('🗑️ Deleting comment');
    
    // Validar contraseña de admin
    if (data.password !== ADMIN_PASSWORD) {
      throw new Error('Invalid admin password');
    }
    
    const publicationId = data.publicationId;
    const commentId = data.commentId;
    
    if (!publicationId || !commentId) {
      throw new Error('Missing required fields');
    }
    
    Logger.log('📍 Publication ID: ' + publicationId);
    Logger.log('🗑️ Comment ID: ' + commentId);
    
    // Obtener la carpeta del estudiante
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const spreadsheet = getOrCreateSpreadsheet(folder);
    const sheet = spreadsheet.getActiveSheet();
    const sheetData = sheet.getDataRange().getValues();
    
    // Buscar el folderId de esta publicación
    let folderId = null;
    for (let i = 1; i < sheetData.length; i++) {
      if (sheetData[i][0] === publicationId) {
        folderId = sheetData[i][8];
        break;
      }
    }
    
    if (!folderId) {
      throw new Error('Publication not found');
    }
    
    const studentFolder = DriveApp.getFolderById(folderId);
    const commentsFolders = studentFolder.getFoldersByName('comments');
    
    if (!commentsFolders.hasNext()) {
      throw new Error('No comments folder found');
    }
    
    const commentsFolder = commentsFolders.next();
    const commentsFiles = commentsFolder.getFilesByName('comments.json');
    
    if (!commentsFiles.hasNext()) {
      throw new Error('No comments file found');
    }
    
    // Leer y filtrar comentarios
    const commentsFile = commentsFiles.next();
    const commentsContent = commentsFile.getBlob().getDataAsString();
    let comments = JSON.parse(commentsContent);
    
    const originalLength = comments.length;
    comments = comments.filter(c => c.id !== commentId);
    
    if (comments.length === originalLength) {
      throw new Error('Comment not found');
    }
    
    // Guardar comentarios actualizados
    const commentsJson = JSON.stringify(comments, null, 2);
    commentsFile.setContent(commentsJson);
    
    Logger.log('✅ Comment deleted successfully');
    
    return {
      success: true,
      deletedCommentId: commentId,
      remainingComments: comments.length
    };
    
  } catch (error) {
    Logger.log('❌ ERROR in deleteComment: ' + error.toString());
    throw error;
  }
}
