// Quick test to verify dashboard routes exist
// Run this to check if routes are properly configured

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Dashboard Routes...\n');

const appJsPath = path.join(__dirname, 'frontend', 'src', 'App.js');

if (!fs.existsSync(appJsPath)) {
  console.error('❌ App.js not found at:', appJsPath);
  process.exit(1);
}

const appJsContent = fs.readFileSync(appJsPath, 'utf8');

const routes = [
  { path: '/dashboard/customer', role: 'Customer', name: 'Customer Dashboard' },
  { path: '/dashboard/tailor', role: 'Tailor', name: 'Tailor Dashboard' },
  { path: '/admin/dashboard', role: 'Admin', name: 'Admin Dashboard' }
];

console.log('Checking routes in App.js:\n');

let allFound = true;

routes.forEach(route => {
  const found = appJsContent.includes(`path="${route.path}"`);
  const status = found ? '✅' : '❌';
  console.log(`${status} ${route.path}`);
  console.log(`   Role: ${route.role}`);
  console.log(`   Name: ${route.name}`);
  console.log('');
  
  if (!found) {
    allFound = false;
  }
});

if (allFound) {
  console.log('🎉 All dashboard routes found!\n');
  console.log('Routes are correctly configured.');
  console.log('');
  console.log('Next steps:');
  console.log('1. Restart frontend: cd frontend && npm start');
  console.log('2. Restart backend: cd backend && npm start');
  console.log('3. Try Google Sign-In again');
} else {
  console.log('⚠️  Some routes are missing!\n');
  console.log('This might cause blank page issues.');
  console.log('Check frontend/src/App.js for route definitions.');
}

console.log('\n' + '='.repeat(50));
