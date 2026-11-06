const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'fakeData.ts');
let content = fs.readFileSync(filePath, 'utf8');

const idToVideo = {
  // Chest
  'chest-pushups': 'chest_pushups',
  'chest-incline-press': 'chest_incline_press',
  'chest-flyes': 'chest_flyes',
  'chest-diamond': 'chest_diamond',
  'chest-cable-cross': 'chest_cable_cross',
  'chest-decline-pushups': 'chest_decline_pushups',

  // Back
  'back-pullups': 'back_pullups',
  'back-db-row': 'back_db_row',
  'back-lat-pulldown': 'back_lat_pulldown',
  'back-superman': 'back_face_pulls',
  'back-deadlifts': 'back_deadlifts',
  'back-single-row': 'back_db_row',

  // Shoulders
  'shoulders-overhead-press': 'shoulders_overhead_press',
  'shoulders-lateral-raise': 'shoulders_lateral_raise',
  'shoulders-front-raise': 'shoulders_front_raise',
  'shoulders-arnold-press': 'shoulders_arnold_press',
  'shoulders-rear-delt-fly': 'shoulders_rear_delt_fly',
  'shoulders-pike-pushups': 'shoulders_upright_row',

  // Arms
  'arms-bicep-curls': 'arms_bicep_curls',
  'arms-tricep-dips': 'arms_tricep_dips',
  'arms-hammer-curls': 'arms_hammer_curls',
  'arms-overhead-extension': 'arms_overhead_extension',
  'arms-concentration-curl': 'arms_preacher_curl',
  'arms-skull-crushers': 'arms_triceps_pushdown',

  // Abs
  'abs-plank': 'abs_plank',
  'abs-bicycle-crunches': 'abs_bicycle_crunches',
  'abs-russian-twists': 'abs_russian_twists',
  'abs-hanging-leg-raise': 'abs_hanging_leg_raise',
  'abs-wheel-rollout': 'abs_wheel_rollout',
  'abs-mountain-climbers': 'abs_bicycle_crunches',

  // Legs
  'legs-air-squats': 'legs_bulgarian_split',
  'legs-walking-lunges': 'legs_bulgarian_split',
  'legs-bulgarian-split': 'legs_bulgarian_split',
  'legs-romanian-deadlift': 'legs_romanian_deadlift',
  'legs-calf-raises': 'back_deadlifts',
  'legs-wall-sit': 'abs_plank',
};

// Replace videoUrl for workouts
content = content.replace(
  /id: 'full-body-burn'[\s\S]*?videoUrl: '[^']*'/,
  (match) => match.replace(/videoUrl: '[^']*'/, "videoUrl: 'chest_pushups'")
);
content = content.replace(
  /id: 'chest-blast'[\s\S]*?videoUrl: '[^']*'/,
  (match) => match.replace(/videoUrl: '[^']*'/, "videoUrl: 'chest_pushups'")
);
content = content.replace(
  /id: 'core-crusher'[\s\S]*?videoUrl: '[^']*'/,
  (match) => match.replace(/videoUrl: '[^']*'/, "videoUrl: 'abs_plank'")
);
content = content.replace(
  /id: 'leg-day'[\s\S]*?videoUrl: '[^']*'/,
  (match) => match.replace(/videoUrl: '[^']*'/, "videoUrl: 'legs_bulgarian_split'")
);
content = content.replace(
  /id: 'arm-pump'[\s\S]*?videoUrl: '[^']*'/,
  (match) => match.replace(/videoUrl: '[^']*'/, "videoUrl: 'arms_bicep_curls'")
);

// Replace videoUrl for each exercise
for (const [id, videoKey] of Object.entries(idToVideo)) {
  const regex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?videoUrl:\\s*')[^']*(')`, 'g');
  content = content.replace(regex, `$1${videoKey}$2`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('fakeData.ts successfully updated with canonical 3D exercise videos!');
