// scripts/generate-icons.js
const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const SOURCE_PATH = process.argv[2] || 'C:/Users/sefer/.gemini/antigravity/brain/c1b42039-8386-4831-8f3f-8e9732fb5bd5/.user_uploaded/media_1790824799653.png';
const ROOT_DIR = path.resolve(__dirname, '..');
const BRAND_COLOR = 0x821928ff;

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Packs multiple PNG buffers into a single standard Windows .ico file
 */
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type (1)
  header.writeUInt16LE(count, 4); // Number of images

  let currentOffset = 6 + count * 16;
  const entries = [];

  for (const { width, height, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2); // Color count
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // Image data size
    entry.writeUInt32LE(currentOffset, 12); // Image data offset
    entries.push(entry);
    currentOffset += buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(p => p.buffer)]);
}

async function run() {
  console.log('🖼️  Leyendo imagen origen:', SOURCE_PATH);
  if (!fs.existsSync(SOURCE_PATH)) {
    throw new Error(`No se encontró el archivo origen: ${SOURCE_PATH}`);
  }

  const master = await Jimp.read(SOURCE_PATH);
  console.log(`✅ Imagen cargada: ${master.bitmap.width}x${master.bitmap.height}`);

  // 1. Guardar copia master en assets/icon.png
  const assetsDir = path.join(ROOT_DIR, 'assets');
  ensureDir(assetsDir);
  fs.copyFileSync(SOURCE_PATH, path.join(assetsDir, 'icon.png'));
  console.log('✅ Master guardado en assets/icon.png');

  // 2. Generar assets/icon.ico para Windows (NSIS / Electron)
  console.log('\n🪟 Generando assets/icon.ico para Windows...');
  const winIcoSizes = [256, 128, 64, 48, 32, 24, 16];
  const winPngBuffers = [];
  for (const size of winIcoSizes) {
    const resized = master.clone().resize({ w: size, h: size });
    const buffer = await resized.getBuffer('image/png');
    winPngBuffers.push({ width: size, height: size, buffer });
  }
  const winIcoBuffer = createIco(winPngBuffers);
  fs.writeFileSync(path.join(assetsDir, 'icon.ico'), winIcoBuffer);
  console.log(`✅ assets/icon.ico generado (${winIcoBuffer.length} bytes, multi-resolución: ${winIcoSizes.join(', ')})`);

  // 3. Generar favicons y logos en public/
  console.log('\n🌐 Generando iconos Web / Electron (public/)...');
  const publicDir = path.join(ROOT_DIR, 'public');
  ensureDir(publicDir);

  // public/favicon.ico
  const favIcoSizes = [64, 32, 24, 16];
  const favPngBuffers = [];
  for (const size of favIcoSizes) {
    const resized = master.clone().resize({ w: size, h: size });
    const buffer = await resized.getBuffer('image/png');
    favPngBuffers.push({ width: size, height: size, buffer });
  }
  const favIcoBuffer = createIco(favPngBuffers);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favIcoBuffer);
  console.log('✅ public/favicon.ico generado');

  // public/logo192.png
  const logo192 = master.clone().resize({ w: 192, h: 192 });
  const logo192Buf = await logo192.getBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'logo192.png'), logo192Buf);
  console.log('✅ public/logo192.png generado');

  // public/logo512.png
  const logo512 = master.clone().resize({ w: 512, h: 512 });
  const logo512Buf = await logo512.getBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, 'logo512.png'), logo512Buf);
  console.log('✅ public/logo512.png generado');

  // public/icons/512x512.png (para Linux y build)
  const publicIconsDir = path.join(publicDir, 'icons');
  ensureDir(publicIconsDir);
  fs.writeFileSync(path.join(publicIconsDir, '512x512.png'), logo512Buf);
  console.log('✅ public/icons/512x512.png generado');

  const buildIconsDir = path.join(ROOT_DIR, 'build', 'icons');
  ensureDir(buildIconsDir);
  fs.writeFileSync(path.join(buildIconsDir, '512x512.png'), logo512Buf);
  console.log('✅ build/icons/512x512.png generado');

  // 4. Generar iconos para Android (android/app/src/main/res/)
  console.log('\n🤖 Generando iconos para Android...');
  const resDir = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'res');

  const androidDensities = [
    { name: 'mipmap-mdpi', launcherSize: 48, fgSize: 108 },
    { name: 'mipmap-hdpi', launcherSize: 72, fgSize: 162 },
    { name: 'mipmap-xhdpi', launcherSize: 96, fgSize: 216 },
    { name: 'mipmap-xxhdpi', launcherSize: 144, fgSize: 324 },
    { name: 'mipmap-xxxhdpi', launcherSize: 192, fgSize: 432 },
  ];

  // Base circular para ic_launcher_round
  const roundBase1024 = new Jimp({ width: 1024, height: 1024, color: BRAND_COLOR });
  roundBase1024.circle();
  const scaledForRound = master.clone().resize({ w: 900, h: 900 });
  roundBase1024.composite(scaledForRound, 62, 62);
  roundBase1024.circle(); // asegurar bordes transparentes

  // Foreground adaptativo base (1080x1080 canvas para safe zone 66%)
  // En Android adaptive icon, el canvas total es 108dp y el safe zone es 72dp (66.6%)
  // Escalamos el logo a ~740x740 centrado en 1080x1080
  const fgBaseCanvas = new Jimp({ width: 1080, height: 1080, color: 0x00000000 });
  const scaledFg = master.clone().resize({ w: 740, h: 740 });
  fgBaseCanvas.composite(scaledFg, (1080 - 740) / 2, (1080 - 740) / 2);

  for (const density of androidDensities) {
    const targetDir = path.join(resDir, density.name);
    ensureDir(targetDir);

    // ic_launcher.png (icono clásico/squircle)
    const launcher = master.clone().resize({ w: density.launcherSize, h: density.launcherSize });
    const launcherBuf = await launcher.getBuffer('image/png');
    fs.writeFileSync(path.join(targetDir, 'ic_launcher.png'), launcherBuf);

    // ic_launcher_round.png (icono redondo)
    const roundLauncher = roundBase1024.clone().resize({ w: density.launcherSize, h: density.launcherSize });
    const roundLauncherBuf = await roundLauncher.getBuffer('image/png');
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_round.png'), roundLauncherBuf);

    // ic_launcher_foreground.png (foreground de adaptive icon)
    const fg = fgBaseCanvas.clone().resize({ w: density.fgSize, h: density.fgSize });
    const fgBuf = await fg.getBuffer('image/png');
    fs.writeFileSync(path.join(targetDir, 'ic_launcher_foreground.png'), fgBuf);

    console.log(`  -> ${density.name}: launcher=${density.launcherSize}px, round=${density.launcherSize}px, fg=${density.fgSize}px`);
  }

  // 5. Actualizar color de fondo en Android ic_launcher_background.xml
  const bgXmlPath = path.join(resDir, 'values', 'ic_launcher_background.xml');
  const bgXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#821928</color>
</resources>
`;
  fs.writeFileSync(bgXmlPath, bgXmlContent, 'utf8');
  console.log('✅ android values/ic_launcher_background.xml actualizado a #821928');

  const drawableBgPath = path.join(resDir, 'drawable', 'ic_launcher_background.xml');
  if (fs.existsSync(drawableBgPath)) {
    let drawableBg = fs.readFileSync(drawableBgPath, 'utf8');
    drawableBg = drawableBg.replace(/android:fillColor="[^"]*"/, 'android:fillColor="#821928"');
    fs.writeFileSync(drawableBgPath, drawableBg, 'utf8');
    console.log('✅ android drawable/ic_launcher_background.xml actualizado a #821928');
  }

  console.log('\n🎉 ¡Todos los iconos de Windows, Web y Android se generaron exitosamente!');
}

run().catch((err) => {
  console.error('❌ Error generando iconos:', err);
  process.exit(1);
});
