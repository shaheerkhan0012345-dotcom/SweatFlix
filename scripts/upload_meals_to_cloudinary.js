const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 1. Load .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.replace(/(^['"]|['"]$)/g, '').trim();
      process.env[key] = value;
    }
  });
}

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dkpv0eax8';
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const ASSETS_JSON_PATH = path.join(__dirname, '..', 'constants', 'cloudinaryAssets.json');

console.log('Testing Cloudinary upload for meals & challenges...');
console.log(`Cloud Name : ${CLOUD_NAME}`);
console.log(`API Key    : ${API_KEY ? API_KEY.substring(0, 6) + '...' : '(none)'}`);

function generateSignature(params, apiSecret) {
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(serialized + apiSecret).digest('hex');
}

async function uploadFile(filePath, publicId) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);

  const formData = new FormData();
  formData.append('file', blob, path.basename(filePath));
  formData.append('public_id', publicId);

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    public_id: publicId,
    timestamp: String(timestamp),
  };
  const signature = generateSignature(paramsToSign, API_SECRET);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error ? data.error.message : `HTTP ${response.status}`);
  }

  // Generate optimized CDN URL with f_auto, q_auto
  const optimizedUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_800/${publicId}.${path.extname(filePath).replace('.', '')}`;
  return { secure_url: data.secure_url, optimized_url: optimizedUrl };
}

async function run() {
  let assetsMap = {};
  if (fs.existsSync(ASSETS_JSON_PATH)) {
    try {
      assetsMap = JSON.parse(fs.readFileSync(ASSETS_JSON_PATH, 'utf8'));
    } catch {}
  }

  if (!assetsMap.meals) assetsMap.meals = {};
  if (!assetsMap.challenges) assetsMap.challenges = {};

  // Upload Meals
  const mealsDir = path.join(__dirname, '..', 'assets', 'images', 'meals');
  if (fs.existsSync(mealsDir)) {
    const mealFiles = fs.readdirSync(mealsDir).filter((f) => f.endsWith('.jpg') || f.endsWith('.png'));
    console.log(`\nFound ${mealFiles.length} meal images in ${mealsDir}:`);
    for (const [idx, file] of mealFiles.entries()) {
      const key = file.replace(/\.(jpg|png)$/, '');
      const publicId = `sweatflix/meals/${key}`;
      const filePath = path.join(mealsDir, file);
      process.stdout.write(`  [${idx + 1}/${mealFiles.length}] Uploading ${file}... `);
      try {
        const res = await uploadFile(filePath, publicId);
        assetsMap.meals[key] = res.optimized_url;
        console.log(`OK: ${res.optimized_url}`);
      } catch (e) {
        console.log(`FAILED: ${e.message}`);
      }
    }
  }

  // Upload Challenges
  const imagesDir = path.join(__dirname, '..', 'assets', 'images');
  const challengeFiles = ['challenge_fatburn_3d.png', 'challenge_purple_3d.png', 'challenge_rebuild_3d.png'];
  console.log(`\nUploading 3D Challenge cards:`);
  for (const file of challengeFiles) {
    const filePath = path.join(imagesDir, file);
    if (fs.existsSync(filePath)) {
      const key = file.replace(/\.png$/, '');
      const publicId = `sweatflix/challenges/${key}`;
      process.stdout.write(`  Uploading ${file}... `);
      try {
        const res = await uploadFile(filePath, publicId);
        assetsMap.challenges[key] = res.optimized_url;
        console.log(`OK: ${res.optimized_url}`);
      } catch (e) {
        console.log(`FAILED: ${e.message}`);
      }
    }
  }

  fs.writeFileSync(ASSETS_JSON_PATH, JSON.stringify(assetsMap, null, 2), 'utf8');
  console.log(`\nUpdated ${ASSETS_JSON_PATH} with Cloudinary CDN URLs successfully!`);
}

run().catch((e) => console.error(e));
