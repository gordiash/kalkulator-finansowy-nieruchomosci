const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 === RAILWAY ENVIRONMENT DEBUG ===');

// 1. Basic info
console.log('\n📍 BASIC INFO:');
console.log(`Working Directory: ${process.cwd()}`);
console.log(`Node Version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Environment: ${process.env.NODE_ENV}`);

// 2. PATH analysis
console.log('\n🛤️ PATH ANALYSIS:');
console.log(`PATH: ${process.env.PATH}`);
const pathDirs = process.env.PATH.split(':');
pathDirs.forEach((dir, index) => {
  console.log(`  [${index}] ${dir}`);
});

// 3. Python search
console.log('\n🐍 PYTHON SEARCH:');
const pythonPaths = [
  '/usr/bin/python3',
  '/usr/bin/python', 
  '/usr/local/bin/python3',
  '/usr/local/bin/python',
  'python3',
  'python'
];

pythonPaths.forEach(pythonPath => {
  try {
    if (fs.existsSync(pythonPath)) {
      console.log(`✅ EXISTS: ${pythonPath}`);
      // Try to get version
      exec(`${pythonPath} --version`, (error, stdout, stderr) => {
        if (!error) {
          console.log(`   Version: ${stdout.trim() || stderr.trim()}`);
        }
      });
    } else {
      console.log(`❌ MISSING: ${pythonPath}`);
    }
  } catch (e) {
    console.log(`❌ ERROR checking ${pythonPath}: ${e.message}`);
  }
});

// 4. Directory structure
console.log('\n📁 DIRECTORY STRUCTURE:');
const checkDirs = ['models', 'scripts', '.next', 'node_modules'];
checkDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${dir}/`);
    try {
      const files = fs.readdirSync(fullPath);
      console.log(`   Files: ${files.length}`);
      if (dir === 'models' || dir === 'scripts') {
        files.forEach(file => {
          const filePath = path.join(fullPath, file);
          const stats = fs.statSync(filePath);
          const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
          console.log(`   - ${file} (${sizeMB}MB)`);
        });
      }
    } catch (e) {
      console.log(`   Error reading: ${e.message}`);
    }
  } else {
    console.log(`❌ ${dir}/ (missing)`);
  }
});

// 5. Essential ML files check
console.log('\n🤖 ML FILES CHECK:');
const mlFiles = [
  'models/ensemble_optimized_0.79pct.pkl',
  'models/valuation_rf.pkl',
  'scripts/predict_ensemble_compatible.py',
  'scripts/predict_rf.py'
];

mlFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
    console.log(`✅ ${file} (${sizeMB}MB)`);
  } else {
    console.log(`❌ ${file} (missing)`);
  }
});

// 6. Environment variables
console.log('\n🌍 ENVIRONMENT VARIABLES:');
const envVars = [
  'NODE_ENV',
  'RAILWAY_ENVIRONMENT', 
  'PATH',
  'PWD',
  'HOME',
  'PYTHONPATH',
  'VIRTUAL_ENV'
];

envVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${value}`);
  } else {
    console.log(`❌ ${envVar}: (not set)`);
  }
});

// 7. Which commands test
console.log('\n🔍 WHICH COMMANDS:');
const commands = ['python3', 'python', 'pip3', 'pip'];
commands.forEach(cmd => {
  exec(`which ${cmd}`, (error, stdout, stderr) => {
    if (!error && stdout.trim()) {
      console.log(`✅ which ${cmd}: ${stdout.trim()}`);
    } else {
      console.log(`❌ which ${cmd}: not found`);
    }
  });
});

console.log('\n🔍 === DEBUG COMPLETE ==='); 