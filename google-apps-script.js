// ========================================
// Code Arena 2025 - Ambassador Form Handler
// Google Apps Script for Form Submissions
// Version 2.0 - Simplified with Setup Function
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
 * Simplified form with 6 essential fields
 */
function initializeHeaders(sheet) {
  const headers = [
    'Timestamp',
    'Nom',
    'Prénom',
    'Email',
    'Téléphone',
    'Université',
    'Lien Facebook'
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
 * Simplified for 6-field form
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
    'Université': 'universite',
    'Lien Facebook': 'facebookLink'
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
  Logger.log('Téléphone: ' + formData.telephone);
  Logger.log('Université: ' + formData.universite);
  Logger.log('Facebook: ' + formData.facebookLink);
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
      universite: 'ESPRIT',
      facebookLink: 'https://facebook.com/testuser'
    }
  };
  
  const response = doPost(mockEvent);
  Logger.log('Test Response: ' + response.getContent());
}

/**
 * Setup sheet with headers and formatting
 * Run this once to initialize the spreadsheet
 */
function setupSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Create or get the 'Réponses' sheet
    let sheet = ss.getSheetByName('Réponses');
    if (!sheet) {
      sheet = ss.insertSheet('Réponses');
    }
    
    // Clear existing data if any
    sheet.clear();
    
    // Initialize headers
    initializeHeaders(sheet);
    
    // Add sample row to show format
    const sampleData = [
      new Date().toLocaleString('fr-FR'),
      'Dupont',
      'Jean',
      'jean.dupont@example.com',
      '+216 12 345 678',
      'ESPRIT',
      'https://facebook.com/jeandupont'
    ];
    
    // Add sample row with light formatting
    sheet.getRange(2, 1, 1, sampleData.length).setValues([sampleData]);
    formatRow(sheet, 2);
    sheet.getRange(2, 1, 1, sampleData.length).setFontStyle('italic');
    sheet.getRange(2, 1, 1, sampleData.length).setFontColor('#999999');
    
    // Add instructions
    sheet.insertRows(3, 2);
    const instructionCell = sheet.getRange(3, 1);
    instructionCell.setValue('⬆️ Sample row above. Actual submissions will appear below.');
    instructionCell.setFontSize(10);
    instructionCell.setFontColor('#666666');
    instructionCell.setBackground('#FFFACD');
    
    // Adjust column widths for better readability
    sheet.setColumnWidth(1, 180); // Timestamp
    sheet.setColumnWidth(2, 120); // Nom
    sheet.setColumnWidth(3, 120); // Prénom
    sheet.setColumnWidth(4, 200); // Email
    sheet.setColumnWidth(5, 150); // Téléphone
    sheet.setColumnWidth(6, 150); // Université
    sheet.setColumnWidth(7, 250); // Lien Facebook
    
    // Show success message
    SpreadsheetApp.getUi().alert(
      '✅ Setup Complete!\n\n' +
      'Sheet "Réponses" has been initialized with:\n' +
      '✓ Headers formatted with teal background\n' +
      '✓ Sample row for reference\n' +
      '✓ Column widths optimized\n' +
      '✓ Ready to receive submissions\n\n' +
      'Delete the sample row (row 2) when ready.'
    );
    
    Logger.log('Sheet setup completed successfully');
    
  } catch (error) {
    Logger.log('Error during setup: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Setup Error: ' + error.toString());
  }
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
    
  SpreadsheetApp.getUi().alert('✅ Notifications email activées !');
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
    // Build a themed HTML email using inline styles. Try to attach `image.png` from Drive as inline image.
    var primary = '#FF6B35';
    var secondary = '#4ECDC4';
    var plainBody = 'Nouvelle candidature envoyée. Voir les détails dans le tableau.';

    // Try to fetch the logo from Drive by filename 'image.png' (added to repo previously)
    var inlineImages = {};
    var logoCid = null;
    try {
      var files = DriveApp.getFilesByName('image.png');
      if (files.hasNext()) {
        var file = files.next();
        inlineImages['logoImg'] = file.getBlob();
        logoCid = 'logoImg';
      }
    } catch (err) {
      Logger.log('Could not load inline logo: ' + err.toString());
    }

    var htmlBody = '' +
      '<div style="font-family: Arial, Helvetica, sans-serif; color:#222; max-width:600px; margin:0 auto;">' +
        '<div style="background:#0A0E27; padding:20px; border-radius:8px; color:#fff; text-align:center;">' +
          (logoCid ? ('<img src="cid:' + logoCid + '" alt="logo" style="max-height:64px; display:block; margin:0 auto 12px;"/>') : '') +
          '<h2 style="margin:0; font-size:20px; color: ' + secondary + ';">Code Arena 2025</h2>' +
          '<p style="margin:6px 0 0; color:#dfe7f0; font-size:13px">Nouvelle candidature - Ambassadeur</p>' +
        '</div>' +
        '<div style="background:#fff; padding:18px; color:#111; border-radius:0 0 8px 8px; border:1px solid rgba(0,0,0,0.06);">' +
          '<h3 style="color:' + primary + '; margin-top:0;">Détails de la candidature</h3>' +
          '<table style="width:100%; border-collapse:collapse; font-size:14px; color:#222">' +
            '<tr><td style="padding:6px 8px; font-weight:600; width:35%">Nom</td><td style="padding:6px 8px">' + values[1] + '</td></tr>' +
            '<tr><td style="padding:6px 8px; font-weight:600">Prénom</td><td style="padding:6px 8px">' + values[2] + '</td></tr>' +
            '<tr><td style="padding:6px 8px; font-weight:600">Email</td><td style="padding:6px 8px">' + values[3] + '</td></tr>' +
            '<tr><td style="padding:6px 8px; font-weight:600">Téléphone</td><td style="padding:6px 8px">' + values[4] + '</td></tr>' +
            '<tr><td style="padding:6px 8px; font-weight:600">Université</td><td style="padding:6px 8px">' + values[5] + '</td></tr>' +
            '<tr><td style="padding:6px 8px; font-weight:600">Facebook</td><td style="padding:6px 8px"><a href="' + values[6] + '" target="_blank">' + values[6] + '</a></td></tr>' +
            '<tr><td style="padding:6px 8px; font-weight:600">Date</td><td style="padding:6px 8px">' + values[0] + '</td></tr>' +
          '</table>' +
          '<p style="margin:14px 0 0; font-size:13px; color:#444">Consulter la feuille de réponses: <a href="' + ss.getUrl() + '" target="_blank">Ouvrir le tableur</a></p>' +
        '</div>' +
      '</div>';

    try {
      MailApp.sendEmail({
        to: recipientEmail,
        subject: subject,
        htmlBody: htmlBody,
        body: plainBody,
        inlineImages: inlineImages
      });
    } catch (error) {
      Logger.log('Error sending HTML email: ' + error.toString());
      // Fallback to plain text mail
      try {
        MailApp.sendEmail(recipientEmail, subject, plainBody + '\n\n' + 'Consulter: ' + ss.getUrl());
      } catch (err) {
        Logger.log('Fallback email failed: ' + err.toString());
      }
    }
  }
}

/**
 * Create custom menu
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🏆 Code Arena 2025')
    .addItem('⚙️ Setup Sheet Headers', 'setupSheet')
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
  
  SpreadsheetApp.getUi().alert('✅ Export réussi!\n\nFichier: ' + file.getName() + '\n\n' + file.getUrl());
}

/**
 * Show about dialog
 */
function showAbout() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    '🏆 Code Arena 2025',
    'Formulaire Ambassadeurs\n\n' +
    'Version 2.0 - Formulaire Simplifié\n\n' +
    'Features:\n' +
    '• Setup automated with one click\n' +
    '• 6 essential fields\n' +
    '• Email notifications\n' +
    '• CSV export\n\n' +
    'Contact: acm@esprit.tn',
    ui.ButtonSet.OK
  );
}

