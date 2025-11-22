// ========================================
// Code Arena 2025 - Ambassador Form Handler
// Google Apps Script for Form Submissions
// Version 1.1 - Fixed headers error
// ========================================

/**
 * Main function to handle POST requests from the web form
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  
  try {
    // Wait up to 30 seconds for lock
    lock.waitLock(30000);
    
    // Get the active spreadsheet and sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Réponses') || ss.getSheets()[0];
    
    // Parse the form data
    const formData = parseFormData(e);
    
    // Initialize headers if this is the first submission OR if headers are missing
    if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
      initializeHeaders(sheet);
    }
    
    // Get headers and prepare row data
    let headers = getHeaders(sheet);
    
    // Verify headers exist
    if (!headers || headers.length === 0) {
      Logger.log('Headers are empty, reinitializing...');
      initializeHeaders(sheet);
      headers = getHeaders(sheet);
    }
    
    const rowData = prepareRowData(headers, formData);
    
    // Append the new row
    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);
    
    // Format the new row
    formatRow(sheet, nextRow);
    
    // Log the submission
    logSubmission(formData);
    
    // Send success response
    return createResponse({
      result: 'success',
      row: nextRow,
      timestamp: new Date().toISOString(),
      message: 'Candidature enregistrée avec succès'
    });
    
  } catch (error) {
    // Log error for debugging
    Logger.log('Error in doPost: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);
    
    // Send error response
    return createResponse({
      result: 'error',
      error: error.toString(),
      timestamp: new Date().toISOString()
    });
    
  } finally {
    // Always release the lock
    lock.releaseLock();
  }
}

/**
 * Parse form data from POST request
 * Handles both URL-encoded and JSON content types
 */
function parseFormData(e) {
  const data = {};
  
  try {
    // Handle different content types
    if (e.postData) {
      const contentType = e.postData.type;
      
      if (contentType === 'application/x-www-form-urlencoded') {
        // Parse URL-encoded data
        const params = e.parameter;
        for (const key in params) {
          data[key] = params[key];
        }
      } else if (contentType === 'application/json') {
        // Parse JSON data
        const jsonData = JSON.parse(e.postData.contents);
        Object.assign(data, jsonData);
      }
    } else if (e.parameter) {
      // Fallback to parameters
      Object.assign(data, e.parameter);
    }
    
    // Add timestamp if not present
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }
    
    Logger.log('Parsed form data keys: ' + Object.keys(data).join(', '));
    
  } catch (error) {
    Logger.log('Error parsing form data: ' + error.toString());
    throw new Error('Impossible de parser les données du formulaire');
  }
  
  return data;
}

/**
 * Initialize spreadsheet headers with formatting
 * Updated to match optimized form fields
 */
function initializeHeaders(sheet) {
  const headers = [
    'Timestamp',
    'Nom',
    'Prénom',
    'Email',
    'Téléphone',
    'Statut',
    'Niveau ESPRIT',
    'Spécialité ESPRIT',
    'Établissement Externe',
    'Membre ACM',
    'Autre Chapitre ACM',
    'Participation Compétitions',
    'Détails Compétitions',
    'Langages',
    'Profils Coding',
    'Motivation',
    'Stratégie Promotion',
    'Qualités Ambassadeur',
    'Réunions Préparation',
    'Disponibilité Événement',
    'Promotion Réseaux',
    'Compétences',
    'Nom Référence',
    'Email Référence',
    'Relation Référence',
    'Déclarations',
    'Autres Infos'
  ];
  
  // Clear any existing content
  sheet.clear();
  
  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format header row with Code Arena theme colors
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4ECDC4'); // Teal color from theme
  headerRange.setFontColor('#FFFFFF');
  headerRange.setWrap(true);
  headerRange.setVerticalAlignment('middle');
  headerRange.setHorizontalAlignment('center');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns for better readability
  for (let i = 1; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 150); // Set default width
  }
  
  Logger.log('Headers initialized: ' + headers.length + ' columns');
}

/**
 * Get headers from the sheet
 */
function getHeaders(sheet) {
  try {
    const lastColumn = sheet.getLastColumn();
    
    if (lastColumn === 0) {
      Logger.log('No columns found in sheet');
      return [];
    }
    
    const headerRange = sheet.getRange(1, 1, 1, lastColumn);
    const headers = headerRange.getValues()[0];
    
    Logger.log('Retrieved headers: ' + headers.length + ' columns');
    return headers;
  } catch (error) {
    Logger.log('Error getting headers: ' + error.toString());
    return [];
  }
}

/**
 * Prepare row data matching headers
 * Maps form field names to header columns
 * Updated to match optimized form
 */
function prepareRowData(headers, formData) {
  // Verify headers is an array
  if (!Array.isArray(headers) || headers.length === 0) {
    Logger.log('ERROR: Headers is not a valid array');
    throw new Error('Headers array is invalid or empty');
  }
  
  const fieldMapping = {
    'Timestamp': 'timestamp',
    'Nom': 'nom',
    'Prénom': 'prenom',
    'Email': 'email',
    'Téléphone': 'telephone',
    'Statut': 'statut',
    'Niveau ESPRIT': 'niveauEsprit',
    'Spécialité ESPRIT': 'specialiteEsprit',
    'Établissement Externe': 'etablissementExterne',
    'Membre ACM': 'membreACM',
    'Autre Chapitre ACM': 'autreChapitreACM',
    'Participation Compétitions': 'participationCompetitions',
    'Détails Compétitions': 'detailsCompetitions',
    'Langages': 'langages',
    'Profils Coding': 'profilsCoding',
    'Motivation': 'motivation',
    'Stratégie Promotion': 'strategiePromotion',
    'Qualités Ambassadeur': 'qualitesAmbassadeur',
    'Réunions Préparation': 'reunionsPreparation',
    'Disponibilité Événement': 'disponibiliteEvenement',
    'Promotion Réseaux': 'promotionReseaux',
    'Compétences': 'competences',
    'Nom Référence': 'nomReference',
    'Email Référence': 'emailReference',
    'Relation Référence': 'relationReference',
    'Déclarations': 'declarations',
    'Autres Infos': 'autresInfos'
  };
  
  return headers.map(function(header) {
    const fieldKey = fieldMapping[header] || header;
    let value = formData[fieldKey] || '';
    
    // Format timestamp for display
    if (header === 'Timestamp' && value) {
      value = formatTimestamp(value);
    }
    
    return value.toString();
  });
}

/**
 * Format timestamp for display in local timezone
 */
function formatTimestamp(timestamp) {
  try {
    const date = new Date(timestamp);
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss');
  } catch (error) {
    return timestamp;
  }
}

/**
 * Format the newly added row for better readability
 */
function formatRow(sheet, rowNumber) {
  const lastColumn = sheet.getLastColumn();
  const range = sheet.getRange(rowNumber, 1, 1, lastColumn);
  
  // Alternate row colors for better readability
  if (rowNumber % 2 === 0) {
    range.setBackground('#F7F7F7');
  }
  
  // Set text wrapping
  range.setWrap(true);
  
  // Set borders
  range.setBorder(true, true, true, true, true, true);
  
  // Set vertical alignment
  range.setVerticalAlignment('top');
}

/**
 * Log submission for debugging purposes
 */
function logSubmission(formData) {
  Logger.log('=== New Submission ===');
  Logger.log('Timestamp: ' + formData.timestamp);
  Logger.log('Nom: ' + formData.nom);
  Logger.log('Prénom: ' + formData.prenom);
  Logger.log('Email: ' + formData.email);
  Logger.log('Statut: ' + formData.statut);
  Logger.log('=====================');
}

/**
 * Create JSON response for the web app
 */
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function for debugging
 * Run this manually to test the submission process
 */
function testDoPost() {
  const mockEvent = {
    parameter: {
      timestamp: new Date().toISOString(),
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      telephone: '+216 12 345 678',
      statut: 'esprit',
      niveauEsprit: '3',
      specialiteEsprit: 'Informatique',
      membreACM: 'esprit',
      participationCompetitions: 'oui',
      detailsCompetitions: 'Codeforces rating 1500',
      langages: 'C++, Python, Java',
      motivation: 'Je suis passionné par la programmation compétitive et je souhaite partager cette passion avec d\'autres étudiants.',
      strategiePromotion: 'Utilisation des réseaux sociaux et organisation de sessions d\'information',
      qualitesAmbassadeur: 'Communication, Leadership, Passion',
      reunionsPreparation: 'oui',
      disponibiliteEvenement: 'physique',
      promotionReseaux: 'oui',
      competences: 'Communication et prise de parole, Leadership, Organisation d\'événements',
      nomReference: 'Dr. Ahmed Ben Ali',
      emailReference: 'ahmed.benali@esprit.tn',
      declarations: 'Que toutes les informations fournies sont exactes, Que je m\'engage à représenter ACM ESPRIT et Code Arena 2025 avec professionnalisme, Que je participerai activement à la promotion de l\'événement, Que je respecterai les valeurs d\'intégrité et de travail d\'équipe'
    }
  };
  
  const response = doPost(mockEvent);
  Logger.log('Test Response: ' + response.getContent());
}

/**
 * Setup email notifications (optional)
 */
function setupEmailNotifications() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const triggers = ScriptApp.getProjectTriggers();
  
  // Remove existing triggers
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'sendEmailNotification') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger
  ScriptApp.newTrigger('sendEmailNotification')
    .forSpreadsheet(ss)
    .onChange()
    .create();
    
  SpreadsheetApp.getUi().alert('Notifications email activées !');
}

/**
 * Send email notification when form is submitted
 */
function sendEmailNotification(e) {
  const recipientEmail = 'acm@esprit.tn';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0];
  const lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    const values = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const subject = '🚀 Nouvelle candidature ambassadeur Code Arena 2025';
    const body = `
Bonjour,

Une nouvelle candidature a été soumise :

📋 INFORMATIONS
━━━━━━━━━━━━━━━━
👤 Nom: ${values[1]} ${values[2]}
📧 Email: ${values[3]}
📱 Téléphone: ${values[4]}
🎓 Statut: ${values[5]}
⏰ Date: ${values[0]}

🔗 CONSULTER
━━━━━━━━━━━━━━━━
${ss.getUrl()}

━━━━━━━━━━━━━━━━
ACM ESPRIT - Code Arena 2025
    `;
    
    try {
      MailApp.sendEmail({
        to: recipientEmail,
        subject: subject,
        body: body
      });
    } catch (error) {
      Logger.log('Error sending email: ' + error.toString());
    }
  }
}

/**
 * Create custom menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏆 Code Arena 2025')
    .addItem('🧪 Tester la soumission', 'testDoPost')
    .addItem('📧 Configurer notifications', 'setupEmailNotifications')
    .addItem('📥 Exporter CSV', 'exportToCSV')
    .addSeparator()
    .addItem('ℹ️ À propos', 'showAbout')
    .addToUi();
}

/**
 * Export to CSV
 */
function exportToCSV() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  let csv = '';
  data.forEach(function(row) {
    csv += row.map(function(cell) {
      return '"' + cell.toString().replace(/"/g, '""') + '"';
    }).join(',') + '\n';
  });
  
  const filename = 'Code_Arena_2025_' + 
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd_HHmmss') + '.csv';
  
  const blob = Utilities.newBlob(csv, 'text/csv', filename);
  const file = DriveApp.createFile(blob);
  
  SpreadsheetApp.getUi().alert('Export réussi!\n\nFichier: ' + file.getName() + '\n\n' + file.getUrl());
}

/**
 * Show about dialog
 */
function showAbout() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    '🏆 Code Arena 2025',
    'Formulaire Ambassadeurs\n\n' +
    'ACM ESPRIT\n' +
    'Version 1.1\n\n' +
    'Contact: acm@esprit.tn',
    ui.ButtonSet.OK
  );
}

