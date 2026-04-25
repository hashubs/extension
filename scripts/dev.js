/* eslint-env node */
const { spawn } = require('child_process');
const { execAsync } = require('./execAsync');

async function dev() {
  console.log('Starting Chrome Dev Mode');

  try {
    // 1. Clean up
    await execAsync('rm', ['-rf', '.parcel-cache', 'dist']);
    // 2. Prepare manifest
    await execAsync('cp', [
      './src/manifest-chrome.json',
      './src/manifest.json',
    ]);

    // 3. Start Parcel Watch
    // "start:chrome": "rm -rf .parcel-cache && cp ./src/manifest-chrome.json ./src/manifest.json && PLATFORM=chrome parcel watch src/manifest.json src/ui/hardware-wallet/ledger.html --no-hmr --no-content-hash --no-autoinstall",
    const env = Object.assign({}, process.env, { PLATFORM: 'chrome' });
    const parcel = spawn(
      './node_modules/.bin/parcel',
      [
        'watch',
        'src/manifest.json',
        'src/index.html',
        '--no-hmr',
        '--no-content-hash',
        '--no-autoinstall',
      ],
      { env, stdio: 'inherit' }
    );

    parcel.on('close', (code) => {
      console.log(`Parcel process exited with code ${code}`);
    });
  } catch (err) {
    console.error('Failed to start dev mode:', err);
    process.exit(1);
  }
}

dev();
