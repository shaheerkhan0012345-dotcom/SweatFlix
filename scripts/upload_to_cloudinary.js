/**
 * SweatFlix Cloudinary Batch Uploader Script
 *
 * Uploads local 3D exercise video loops and thumbnail images to your Cloudinary account.
 * Updates constants/cloudinaryAssets.json with the generated Cloudinary CDN URLs.
 *
 * Usage:
 *   node scripts/upload_to_cloudinary.js --cloud dkpv0eax8 --apiKey <API_KEY> --apiSecret <API_SECRET>
 * Or with an unsigned upload preset:
 *   node scripts/upload_to_cloudinary.js --cloud dkpv0eax8 --preset <UPLOAD_PRESET_NAME>
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from .env if present
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

// Parse command line arguments
const args = process.argv.slice(2);
function getArg(flag, fallback) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && args[idx + 1]) return args[idx + 1];
  return fallback;
}

const CLOUD_NAME =
  getArg('--cloud', process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dkpv0eax8');
const API_KEY =
  getArg('--apiKey', process.env.CLOUDINARY_API_KEY || process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_ID);
const API_SECRET =
  getArg('--apiSecret', process.env.CLOUDINARY_API_SECRET);
const UPLOAD_PRESET =
  getArg('--preset', process.env.CLOUDINARY_UPLOAD_PRESET);

const ASSETS_JSON_PATH = path.join(__dirname, '..', 'constants', 'cloudinaryAssets.json');

console.log('====================================================');
console.log('SweatFlix Cloudinary Media Uploader');
console.log('====================================================');
console.log(`Cloud Name : ${CLOUD_NAME}`);
console.log(`API Key    : ${API_KEY ? API_KEY.substring(0, 6) + '...' : '(none)'}`);
console.log(`API Secret : ${API_SECRET ? '******' : '(none)'}`);
console.log(`Preset     : ${UPLOAD_PRESET || '(none)'}`);
console.log('----------------------------------------------------');

if (!API_SECRET && !UPLOAD_PRESET) {
  console.log('⚠️ Notice: To upload files directly to Cloudinary, provide either:');
  console.log('   1) API Secret: node scripts/upload_to_cloudinary.js --apiKey <KEY> --apiSecret <SECRET>');
  console.log('   2) Or an unsigned preset: node scripts/upload_to_cloudinary.js --preset <PRESET_NAME>');
  console.log('');
  console.log('To get your API Key & Secret:');
  console.log('   1. Log into https://console.cloudinary.com/');
  console.log('   2. Go to Dashboard / Settings > API Keys');
  console.log('   3. Copy your "API Key" and "API Secret"');
  console.log('====================================================\n');
}

/**
 * Generate Cloudinary signed upload parameters
 */
function generateSignature(params, apiSecret) {
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  return crypto.createHash('sha1').update(serialized + apiSecret).digest('hex');
}

/**
 * Upload single file using Node 18+ native fetch and FormData
 */
async function uploadFile(filePath, publicId, resourceType) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);

  const formData = new FormData();
  formData.append('file', blob, path.basename(filePath));
  formData.append('public_id', publicId);

  const timestamp = Math.floor(Date.now() / 1000);

  if (API_SECRET && API_KEY) {
    const paramsToSign = {
      public_id: publicId,
      timestamp: String(timestamp),
    };
    const signature = generateSignature(paramsToSign, API_SECRET);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
  } else if (UPLOAD_PRESET) {
    formData.append('upload_preset', UPLOAD_PRESET);
  } else {
    throw new Error('Missing API Secret or Upload Preset for Cloudinary authorization.');
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error ? data.error.message : `HTTP ${response.status}`);
  }

  return data.secure_url;
}

async function run() {
  if (!API_SECRET && !UPLOAD_PRESET) {
    console.log('Aborting upload: authorization credentials needed.');
    process.exit(1);
  }

  let assetsMap = {
    cloudName: CLOUD_NAME,
    folder: 'sweatflix',
    videos: {},
    images: {},
  };

  if (fs.existsSync(ASSETS_JSON_PATH)) {
    try {
      assetsMap = JSON.parse(fs.readFileSync(ASSETS_JSON_PATH, 'utf8'));
    } catch {}
  }

  // 1. Upload Videos from assets/videos/exercises
  const videosDir = path.join(__dirname, '..', 'assets', 'videos', 'exercises');
  if (fs.existsSync(videosDir)) {
    const videoFiles = fs.readdirSync(videosDir).filter((f) => f.endsWith('.mp4'));
    console.log(`\n📹 Found ${videoFiles.length} videos to process in ${videosDir}:`);

    for (const [idx, file] of videoFiles.entries()) {
      const key = file.replace(/\.mp4$/, '');
      const publicId = `sweatflix/videos/${key}`;
      const filePath = path.join(videosDir, file);
      const sizeMb = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);

      process.stdout.write(`  [${idx + 1}/${videoFiles.length}] Uploading ${file} (${sizeMb} MB)... `);
      try {
        const secureUrl = await uploadFile(filePath, publicId, 'video');
        assetsMap.videos[key] = secureUrl;
        console.log(`✅ Success!\n    URL: ${secureUrl}`);
      } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
      }
    }
  }

  // 2. Upload Thumbnails from assets/images/exercise_thumbs
  const thumbsDir = path.join(__dirname, '..', 'assets', 'images', 'exercise_thumbs');
  if (fs.existsSync(thumbsDir)) {
    const thumbFiles = fs.readdirSync(thumbsDir).filter((f) => f.endsWith('.jpg') || f.endsWith('.png'));
    console.log(`\n🖼️  Found ${thumbFiles.length} exercise thumbnails in ${thumbsDir}:`);

    for (const [idx, file] of thumbFiles.entries()) {
      const key = file.replace(/\.(jpg|png)$/, '');
      const publicId = `sweatflix/thumbs/${key}`;
      const filePath = path.join(thumbsDir, file);
      const sizeKb = (fs.statSync(filePath).size / 1024).toFixed(1);

      process.stdout.write(`  [${idx + 1}/${thumbFiles.length}] Uploading ${file} (${sizeKb} KB)... `);
      try {
        const secureUrl = await uploadFile(filePath, publicId, 'image');
        assetsMap.images[key] = secureUrl;
        console.log(`✅ Success!`);
      } catch (err) {
        console.log(`❌ Failed: ${err.message}`);
      }
    }
  }

  // Populate short aliases for all canonical keys
  const ALIAS_MAP = {
    chest_pushups: 'chest_standard_pushups',
    chest_incline_press: 'chest_incline_dumbbell_press',
    chest_flyes: 'chest_dumbbell_flyes',
    chest_diamond: 'chest_diamond_pushups',
    chest_cable_cross: 'chest_cable_crossover',
    chest_decline_pushups: 'chest_decline_pushups',
    back_pullups: 'back_pullups',
    back_db_row: 'back_dumbbell_row',
    back_lat_pulldown: 'back_lat_pulldown',
    back_deadlifts: 'back_barbell_deadlift',
    back_face_pulls: 'back_cable_face_pulls',
    shoulders_overhead_press: 'shoulders_military_press',
    shoulders_lateral_raise: 'shoulders_lateral_raises',
    shoulders_front_raise: 'shoulders_front_plate_raise',
    shoulders_arnold_press: 'shoulders_arnold_press',
    shoulders_rear_delt_fly: 'shoulders_reverse_pec_deck',
    shoulders_upright_row: 'shoulders_upright_row',
    arms_bicep_curls: 'arms_barbell_bicep_curl',
    arms_tricep_dips: 'arms_parallel_bar_dips',
    arms_hammer_curls: 'arms_hammer_curl',
    arms_overhead_extension: 'arms_overhead_triceps_ext',
    arms_preacher_curl: 'arms_preacher_curl',
    arms_triceps_pushdown: 'arms_triceps_pushdown',
    arms_rope_pushdown: 'arms_rope_pushdown',
    abs_plank: 'abs_forearm_plank',
    abs_bicycle_crunches: 'abs_bicycle_crunches',
    abs_russian_twists: 'abs_russian_twist',
    abs_hanging_leg_raise: 'abs_hanging_leg_raise',
    abs_wheel_rollout: 'abs_wheel_rollout',
    legs_romanian_deadlift: 'legs_romanian_deadlift',
    legs_bulgarian_split: 'legs_bulgarian_split_squat'
  };

  for (const [shortKey, fileKey] of Object.entries(ALIAS_MAP)) {
    if (assetsMap.videos[fileKey]) assetsMap.videos[shortKey] = assetsMap.videos[fileKey];
    if (assetsMap.images[fileKey]) assetsMap.images[shortKey] = assetsMap.images[fileKey];
  }

  // Save updated map
  fs.writeFileSync(ASSETS_JSON_PATH, JSON.stringify(assetsMap, null, 2), 'utf8');
  console.log(`\n🎉 Completed! Cloudinary asset map saved to ${ASSETS_JSON_PATH}`);
}

run().catch((err) => {
  console.error('\nFatal error during upload process:', err);
});
