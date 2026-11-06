const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const targetDir = path.join(rootDir, 'assets', 'videos', 'exercises');
const targetThumbDir = path.join(rootDir, 'assets', 'images', 'exercise_thumbs');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}
if (!fs.existsSync(targetThumbDir)) {
  fs.mkdirSync(targetThumbDir, { recursive: true });
}

// Exact mapping from source files to canonical target names
const videoMappings = [
  {
    targetName: 'chest_diamond_pushups.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_character_performing_…_1080p_20261008151034.mp4'),
    label: 'Diamond Push-Ups',
  },
  {
    targetName: 'arms_barbell_bicep_curl.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_character_performing_…_1080p_20261008151741.mp4'),
    label: 'Barbell Bicep Curl',
  },
  {
    targetName: 'abs_forearm_plank.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_holding_forear…_1080p_20261008153454.mp4'),
    label: 'Forearm Plank Hold',
  },
  {
    targetName: 'abs_wheel_rollout.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_ab_…_20261008155250.mp4'),
    label: 'Ab Wheel Rollouts',
  },
  {
    targetName: 'shoulders_upright_row.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_bar…_1080p_20261008152514.mp4'),
    label: 'Barbell Upright Row',
  },
  {
    targetName: 'chest_cable_crossover.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_cab…_1080p_20261008151532.mp4'),
    label: 'Cable Crossover',
  },
  {
    targetName: 'arms_triceps_pushdown.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_cab…_1080p_20261008155142.mp4'),
    label: 'Cable Triceps Pushdown',
  },
  {
    targetName: 'chest_decline_pushups.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_dec…_1080p_20261008151605.mp4'),
    label: 'Decline Push-Ups',
  },
  {
    targetName: 'back_dumbbell_row.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_dum…_1080p_20261008151920.mp4'),
    label: 'Single-Arm Dumbbell Row',
  },
  {
    targetName: 'shoulders_lateral_raises.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_dum…_1080p_20261008152122.mp4'),
    label: 'Dumbbell Lateral Raises',
  },
  {
    targetName: 'arms_hammer_curl.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_dum…_1080p_20261008153149.mp4'),
    label: 'Hammer Curls',
  },
  {
    targetName: 'shoulders_military_press.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_mil…_1080p_20261008152049.mp4'),
    label: 'Standing Military Press / Overhead Press',
  },
  {
    targetName: 'arms_parallel_bar_dips.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_par…_1080p_20261008153412.mp4'),
    label: 'Tricep Bench / Parallel Bar Dips',
  },
  {
    targetName: 'shoulders_front_plate_raise.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_pla…_1080p_20261008152319.mp4'),
    label: 'Front Plate Raises',
  },
  {
    targetName: 'arms_preacher_curl.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_pre…_1080p_20261008153310.mp4'),
    label: 'Preacher Curl / Concentration Curl',
  },
  {
    targetName: 'shoulders_reverse_pec_deck.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_rev…_1080p_20261008152351.mp4'),
    label: 'Reverse Pec-Deck Fly / Rear Delt Flyes',
  },
  {
    targetName: 'abs_russian_twist.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_Rus…_1080p_20261008155348.mp4'),
    label: 'Russian Twists',
  },
  {
    targetName: 'arms_rope_pushdown.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_tri…_1080p_20261008153112.mp4'),
    label: 'Rope Tricep Pushdown',
  },
  {
    targetName: 'arms_overhead_triceps_ext.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_figure_performing_tri…_1080p_20261008153231.mp4'),
    label: 'Overhead Tricep Extension',
  },
  {
    targetName: 'abs_bicycle_crunches.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_model_doing_bicycle_c…_20261008155103.mp4'),
    label: 'Bicycle Crunches',
  },
  {
    targetName: 'back_pullups.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_model_doing_pull-ups_1080p_20261008151648.mp4'),
    label: 'Wide-Grip Pull-Ups',
  },
  {
    targetName: 'back_cable_face_pulls.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_model_performing_cabl…_1080p_20261008152014.mp4'),
    label: 'Cable Face Pulls',
  },
  {
    targetName: 'back_barbell_deadlift.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_model_performing_dead…_1080p_20261008152004.mp4'),
    label: 'Barbell Deadlifts',
  },
  {
    targetName: 'shoulders_arnold_press.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_model_performing_dumb…_1080p_20261008152204.mp4'),
    label: 'Arnold Press',
  },
  {
    targetName: 'abs_hanging_leg_raise.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_model_performing_leg_…_20261008153545.mp4'),
    label: 'Hanging Leg Raises',
  },
  {
    targetName: 'legs_romanian_deadlift.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_model_performing_Roma…_1080p_20261008155435.mp4'),
    label: 'Romanian Deadlifts',
  },
  {
    targetName: 'legs_bulgarian_split_squat.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_model_performing_spli…_1080p_20261008155519.mp4'),
    label: 'Bulgarian Split Squats',
  },
  {
    targetName: 'back_lat_pulldown.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Anatomical_model_using_lat_pulld…_20261008151827.mp4'),
    label: 'Lat Pulldowns',
  },
  {
    targetName: 'chest_dumbbell_flyes.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Character_performing_dumbbell_ch…_1080p_20261008150654.mp4'),
    label: 'Chest Flyes',
  },
  {
    targetName: 'chest_incline_dumbbell_press.mp4',
    sourcePath: path.join(rootDir, 'videos', 'chest_diamond_pushups.mp4', 'Anatomical_figure_performing_dum…_1080p_20261008150827.mp4'),
    label: 'Incline Dumbbell Press',
  },
  {
    targetName: 'chest_standard_pushups.mp4',
    sourcePath: path.join(rootDir, 'videos', 'Standard Push-Ups', 'Animation_of_push_up_exercise_20261008135601.mp4'),
    label: 'Standard Push-Ups',
  },
];

console.log(`Starting copying of ${videoMappings.length} canonical exercise videos...`);

videoMappings.forEach((item, index) => {
  const destPath = path.join(targetDir, item.targetName);
  if (!fs.existsSync(item.sourcePath)) {
    console.warn(`[MISSING] ${item.sourcePath}`);
    return;
  }
  fs.copyFileSync(item.sourcePath, destPath);
  const size = fs.statSync(destPath).size;
  console.log(`[${index + 1}/${videoMappings.length}] COPIED: ${item.targetName} (${size} bytes) - ${item.label}`);

  // Extract thumbnail image for UI cards
  const thumbName = item.targetName.replace(/\.mp4$/, '.jpg');
  const thumbPath = path.join(targetThumbDir, thumbName);
  try {
    execSync(`ffmpeg -y -ss 00:00:01.5 -i "${destPath}" -vframes 1 -q:v 2 "${thumbPath}"`, { stdio: 'ignore' });
  } catch (e) {
    try {
      execSync(`ffmpeg -y -ss 00:00:00.5 -i "${destPath}" -vframes 1 -q:v 2 "${thumbPath}"`, { stdio: 'ignore' });
    } catch (err) {}
  }
});

console.log('All canonical videos and thumbnails extracted successfully!');
