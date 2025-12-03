// ========================================
// CONFIGURACIÓN PRINCIPAL
// ========================================

// ID de tu carpeta de Google Drive
const FOLDER_ID = '1YJI7AJe7_RWHRWiY5yT-ZK8w69iMkDs9';

// Nombre de la hoja de calculo
const SPREADSHEET_NAME = 'Student Experiences Database';

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