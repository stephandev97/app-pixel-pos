const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const PocketBase = require('pocketbase/cjs');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();
// Intentar cargar .env.points-example si no hay .env (como fallback ejemplo)
if (!process.env.VITE_POCKETBASE_URL) {
    dotenv.config({ path: '.env.points-example' });
}

// Configuración con fallbacks por defecto
const PB_URL =
    process.env.VITE_PB_URL ||
    process.env.VITE_POCKETBASE_URL ||
    process.env.REACT_APP_PB_URL ||
    'https://railway-production-857d.up.railway.app/';
const PB_EMAIL =
    process.env.PB_EMAIL ||
    process.env.VITE_POS_EMAIL ||
    process.env.REACT_APP_PB_SERVICE_EMAIL ||
    'pos@pixelhelados.com';
const PB_PASSWORD =
    process.env.PB_PASSWORD ||
    process.env.VITE_POS_PASSWORD ||
    process.env.REACT_APP_PB_SERVICE_PASS ||
    '3UyKkcDwXaSt-RhdLV6X-2OlC9fUei7O';

const BUILD_DIR = path.resolve(__dirname, '../android/app/build/outputs/apk/debug');
const APK_NAME = 'app-debug.apk';
const APK_PATH = path.join(BUILD_DIR, APK_NAME);

async function uploadToGitHubRelease(version, apkPath) {
    const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
    if (!token) {
        console.log('⚠️ GH_TOKEN no encontrado, omitiendo subida a GitHub Releases.');
        return null;
    }

    const owner = 'stephandev97';
    const repo = 'app-pixel-pos';
    const tag = `v${version}`;
    const assetName = `pixel-pos-v${version}.apk`;

    console.log(`\n📦 Subiendo APK a GitHub Releases (${owner}/${repo} ${tag})...`);

    // 1. Obtener o crear release
    let release;
    const releaseRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, {
        headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'deploy-android'
        }
    });

    if (releaseRes.ok) {
        release = await releaseRes.json();
    } else {
        console.log(`Creando nueva release ${tag} en GitHub...`);
        const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'deploy-android'
            },
            body: JSON.stringify({
                tag_name: tag,
                name: version,
                body: `Versión ${version}`,
                draft: false,
                prerelease: false
            })
        });
        if (!createRes.ok) {
            const err = await createRes.text();
            throw new Error(`Error creando release en GitHub: ${err}`);
        }
        release = await createRes.json();
    }

    // 2. Si ya existe un asset con ese nombre, eliminarlo primero
    if (release.assets && release.assets.length > 0) {
        const existingAsset = release.assets.find(a => a.name === assetName);
        if (existingAsset) {
            console.log(`Eliminando asset previo ${assetName}...`);
            await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/assets/${existingAsset.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${token}`,
                    'User-Agent': 'deploy-android'
                }
            });
        }
    }

    // 3. Subir el APK a la release
    const apkBuffer = fs.readFileSync(apkPath);
    const uploadUrl = `https://uploads.github.com/repos/${owner}/${repo}/releases/${release.id}/assets?name=${assetName}`;
    const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Length': apkBuffer.length,
            'User-Agent': 'deploy-android'
        },
        body: apkBuffer
    });

    if (!uploadRes.ok) {
        const err = await uploadRes.text();
        throw new Error(`Error subiendo APK a GitHub Release: ${err}`);
    }

    const uploaded = await uploadRes.json();
    console.log(`✅ APK subido a GitHub Release: ${uploaded.browser_download_url}`);
    return uploaded.browser_download_url;
}

async function main() {
    try {
        console.log('🚀 Iniciando despliegue automático de Android...');

        // 1. Construir Web
        console.log('\n📦 Construyendo aplicación web...');
        execSync('npm run build', { stdio: 'inherit' });

        // 2. Sincronizar Capacitor
        console.log('\n🔄 Sincronizando Capacitor...');
        execSync('npx cap sync android', { stdio: 'inherit' });

        // 3. Construir APK
        console.log('\n🤖 Compilando APK (esto puede tardar)...');
        const androidDir = path.resolve(__dirname, '../android');
        const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
        execSync(`${gradlew} assembleDebug`, { cwd: androidDir, stdio: 'inherit' });

        if (!fs.existsSync(APK_PATH)) {
            throw new Error(`❌ No se encontró el APK en: ${APK_PATH}`);
        }
        console.log(`✅ APK generado correctamente: ${APK_PATH}`);

        const packageJson = require('../package.json');
        const version = packageJson.version || '1.0.0';

        // 4. Subir APK a GitHub Releases
        const githubDownloadUrl = await uploadToGitHubRelease(version, APK_PATH);

        // 5. Registrar en PocketBase
        console.log(`\n📤 Registrando versión en PocketBase (${PB_URL})...`);
        const pb = new PocketBase(PB_URL);
        pb.autoCancellation(false);

        let finalUrl = githubDownloadUrl;

        // Si no subió a GitHub, intentar subir como Blob a PocketBase
        if (!finalUrl) {
            const formData = new FormData();
            formData.append('version', version);
            formData.append('notes', `Actualización automática v${version}`);
            const apkBuffer = fs.readFileSync(APK_PATH);
            const blob = new Blob([apkBuffer], { type: 'application/vnd.android.package-archive' });
            formData.append('apk', blob, `pixel-pos-v${version}.apk`);
            const record = await pb.collection('versions').create(formData);
            finalUrl = pb.files.getUrl(record, record.apk) || record.url;
        } else {
            // Buscar si ya existe la versión en PocketBase
            try {
                const existing = await pb.collection('versions').getFirstListItem(`version="${version}"`);
                if (existing) {
                    await pb.collection('versions').update(existing.id, {
                        url: finalUrl,
                        notes: `Actualización automática v${version}`
                    });
                    console.log(`✅ Registro PocketBase v${version} actualizado.`);
                } else {
                    await pb.collection('versions').create({
                        version: version,
                        notes: `Actualización automática v${version}`,
                        url: finalUrl
                    });
                    console.log(`✅ Registro PocketBase v${version} creado.`);
                }
            } catch (pbErr) {
                await pb.collection('versions').create({
                    version: version,
                    notes: `Actualización automática v${version}`,
                    url: finalUrl
                });
                console.log(`✅ Registro PocketBase v${version} creado.`);
            }
        }

        console.log(`\n🎉 ¡Despliegue de Android completado con éxito!`);
        console.log(`📱 Versión: v${version}`);
        console.log(`🔗 URL de descarga: ${finalUrl}`);

    } catch (error) {
        console.error('\n❌ Error en el despliegue:', error.message);
        if (error.response?.data) {
            console.error('Detalles PB:', error.response.data);
        }
        process.exit(1);
    }
}

main();
