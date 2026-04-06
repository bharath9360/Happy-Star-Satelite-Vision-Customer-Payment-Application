const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Comprehensive Test Suite Execution...');

const backendDir = path.join(__dirname, '../backend');
const frontendDir = path.join(__dirname, '../frontend');

let totalPassed = 0;
let totalFailed = 0;
let totalTests = 0;

try {
    console.log('⏳ Running Backend Tests (Jest)...');
    try {
        execSync('npx jest --json --outputFile=backend-results.json', { cwd: backendDir, stdio: 'pipe' });
    } catch (e) {
        // Jest throws an error if tests fail, we still want to parse the JSON
        console.log('⚠️ Some Backend tests failed.');
    }

    const backendResultsPath = path.join(backendDir, 'backend-results.json');
    if (fs.existsSync(backendResultsPath)) {
        const backendData = JSON.parse(fs.readFileSync(backendResultsPath, 'utf8'));
        console.log(`✅ Backend Output Parsed: ${backendData.numPassedTests} passed, ${backendData.numFailedTests} failed.`);
        totalPassed += backendData.numPassedTests;
        totalFailed += backendData.numFailedTests;
        totalTests += backendData.numTotalTests;
    }

    console.log('⏳ Running Frontend Tests (Vitest)...');
    try {
        execSync('npx vitest run --reporter=json --outputFile=frontend-results.json', { cwd: frontendDir, stdio: 'pipe' });
    } catch (e) {
        // Vitest throws an error if tests fail
        console.log('⚠️ Some Frontend tests failed.');
    }

    const frontendResultsPath = path.join(frontendDir, 'frontend-results.json');
    if (fs.existsSync(frontendResultsPath)) {
        const frontendData = JSON.parse(fs.readFileSync(frontendResultsPath, 'utf8'));
        const passed = frontendData.numPassedTests;
        const failed = frontendData.numFailedTests;
        const total = frontendData.numTotalTests;
        
        console.log(`✅ Frontend Output Parsed: ${passed} passed, ${failed} failed.`);
        totalPassed += passed;
        totalFailed += failed;
        totalTests += total;
    }

    console.log('\n=========================================');
    console.log('📊 FINAL TEST EXECUTION REPORT');
    console.log('=========================================');
    console.log(`🎯 Total Tests Run:   ${totalTests}`);
    console.log(`✅ Total Passed:      ${totalPassed}`);
    console.log(`❌ Total Failed:      ${totalFailed}`);
    console.log('=========================================');

    if (totalFailed > 0) {
        process.exit(1);
    }
} catch (err) {
    console.error('❌ Fatal Error executing tests:', err.message);
}
