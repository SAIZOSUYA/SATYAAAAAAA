const fs = require('fs');
const path = require('path');
const db = require('./database');
const datasetLoader = require('./datasetLoader');

const EXPORT_DIR = path.join(__dirname, 'exports');
const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1hCS6JwTl6mHt_5Y0J4tcfFlPOP46M6qq?usp=sharing';
const GOOGLE_DRIVE_FOLDER_ID = '1hCS6JwTl6mHt_5Y0J4tcfFlPOP46M6qq';

function ensureExportDir() {
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
}

function exportUserDatabaseJson() {
  ensureExportDir();
  const users = db.getAllUsers();
  const datasetTraining = datasetLoader.loadDatasetTrainingData();

  const exportPayload = {
    metadata: {
      exported_at: new Date().toISOString(),
      system: 'SatyaLens AI Forensic Intelligence System',
      target_google_drive_folder: GOOGLE_DRIVE_FOLDER_URL,
      google_drive_folder_id: GOOGLE_DRIVE_FOLDER_ID,
      total_user_records: users.length,
      total_dataset_training_samples: datasetTraining.totalSamples || 122123
    },
    users_database: users,
    dataset_training_benchmarks: {
      dtst_nepali_fake_news_samples: 65996,
      sentiment_corpus_samples: 35795,
      fakev2_deepfake_samples: 17857,
      hate_speech_corpus_samples: 2475,
      total_training_samples: datasetTraining.totalSamples || 122123,
      acm_paper_citation: 'citation-359678065 (Niraula, Dulal, Koirala 2022 ACM TALLIP)',
      pdf_training_sources: [
        'IOEGC-16-284-PS2-22.pdf',
        'CYBERCRIMEINNEPALReal-WorldExperiencesScamsOrganizedFraud.pdf'
      ]
    }
  };

  const jsonFilePath = path.join(EXPORT_DIR, 'SatyaLens_User_Database_Export.json');
  fs.writeFileSync(jsonFilePath, JSON.stringify(exportPayload, null, 2), 'utf8');
  console.log(`Database exported to JSON: ${jsonFilePath}`);

  return { exportPayload, jsonFilePath };
}

function exportUserDatabaseCsv() {
  ensureExportDir();
  const users = db.getAllUsers();

  const headers = ['ID', 'Name', 'Email', 'Role', 'Is_Verified', 'Created_At', 'Last_Login'];
  const rows = users.map(u => [
    u.id,
    `"${(u.name || '').replace(/"/g, '""')}"`,
    `"${(u.email || '').replace(/"/g, '""')}"`,
    u.role,
    u.is_verified,
    u.created_at,
    u.last_login
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const csvFilePath = path.join(EXPORT_DIR, 'SatyaLens_User_Database_Export.csv');
  fs.writeFileSync(csvFilePath, csvContent, 'utf8');
  console.log(`Database exported to CSV: ${csvFilePath}`);

  return { csvFilePath, csvContent };
}

// Run exports on execution
const jsonRes = exportUserDatabaseJson();
const csvRes = exportUserDatabaseCsv();

module.exports = {
  GOOGLE_DRIVE_FOLDER_URL,
  GOOGLE_DRIVE_FOLDER_ID,
  exportUserDatabaseJson,
  exportUserDatabaseCsv,
  jsonFilePath: jsonRes.jsonFilePath,
  csvFilePath: csvRes.csvFilePath
};
