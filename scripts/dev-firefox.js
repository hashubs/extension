/* eslint-env node */
const { spawn } = require('child_process');
const { execAsync } = require('./execAsync');

async function dev() {
  console.log('Starting Firefox Dev Mode');

  try {
    // 1. Clean up
    await execAsync('rm', ['-rf', '.parcel-cache', 'dist-firefox']);
    // 2. Prepare manifest
    await execAsync('cp', [
      './src/manifest-firefox.json',
      './src/manifest.json',
    ]);

    // 3. Start Parcel Watch
    // "start:firefox": "rm -rf .parcel-cache && cp ./src/manifest-firefox.json ./src/manifest.json && PLATFORM=firefox parcel watch src/manifest.json src/ui/hardware-wallet/ledger.html --no-hmr --no-content-hash --no-autoinstall --dist-dir dist-firefox",
    const env = Object.assign({}, process.env, { PLATFORM: 'firefox' });
    const parcel = spawn(
      './node_modules/.bin/parcel',
      [
        'watch',
        'src/manifest.json',
        'src/index.html',
        '--no-hmr',
        '--no-content-hash',
        '--no-autoinstall',
        '--dist-dir',
        'dist-firefox',
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
