import cloudinaryAssets from './cloudinaryAssets.json';

export const EXERCISE_3D_ASSETS: Record<string, any> = {
  Shoulders: require('../assets/images/3d/shoulder.jpg'),
  Chest: require('../assets/images/3d/chest.jpg'),
  Arms: require('../assets/images/3d/arms.jpg'),
  Legs: require('../assets/images/3d/legs.jpg'),
  Back: require('../assets/images/3d/back.jpg'),
  Abs: require('../assets/images/3d/abs.jpg'),
  'Full Body': require('../assets/images/3d/hero_athlete.jpg'),
  hero: require('../assets/images/3d/hero_athlete.jpg'),
};

export const ANATOMY_3D_ASSETS = {
  anterior: require('../assets/images/3d/anatomy_anterior.jpg'),
  posterior: require('../assets/images/3d/anatomy_posterior.jpg'),
  anterior_shoulder: require('../assets/images/anatomy/anterior_shoulder.jpg'),
  chest: require('../assets/images/3d/chest.jpg'),
  back: require('../assets/images/3d/back.jpg'),
  shoulder: require('../assets/images/3d/shoulder.jpg'),
  triceps: require('../assets/images/anatomy/triceps.jpg'),
  forearms: require('../assets/images/anatomy/forearms.jpg'),
  biceps: require('../assets/images/anatomy/biceps.jpg'),
  abs: require('../assets/images/3d/abs.jpg'),
  legs: require('../assets/images/3d/legs.jpg'),
};

export const ANATOMY_THUMBNAILS = {
  anteriorDeltoids: require('../assets/images/anatomy/thumb_ant_delts.jpg'),
  frontDelts: require('../assets/images/anatomy/thumb_front_delts.jpg'),
  shoulders: require('../assets/images/anatomy/thumb_shoulders_rail.jpg'),
  chest: require('../assets/images/anatomy/thumb_chest.jpg'),
  back: require('../assets/images/anatomy/thumb_back.jpg'),
  biceps: require('../assets/images/anatomy/biceps.jpg'),
  triceps: require('../assets/images/anatomy/triceps.jpg'),
  forearms: require('../assets/images/anatomy/forearms.jpg'),
};

const mealUrls: Record<string, string> = (cloudinaryAssets as any).meals || {};
const challengeUrls: Record<string, string> = (cloudinaryAssets as any).challenges || {};

export const MEAL_ASSETS: Record<string, any> = {
  ham_slices: require('../assets/images/meals/ham_slices.jpg'),
  spicy_chicken: require('../assets/images/meals/spicy_chicken.jpg'),
  banana_oats: require('../assets/images/meals/banana_oats.jpg'),
  salad_bowl: require('../assets/images/meals/salad_bowl.jpg'),
  dessert_cup: require('../assets/images/meals/dessert_cup.jpg'),
  smoothie_bowl: require('../assets/images/meals/smoothie_bowl.jpg'),
  oatmeal: require('../assets/images/meals/oatmeal.jpg'),
  chicken: require('../assets/images/meals/chicken.jpg'),
  salmon: require('../assets/images/meals/salmon.jpg'),
  yogurt: require('../assets/images/meals/yogurt.jpg'),
};

export const CHALLENGE_ASSETS = {
  fatburn: require('../assets/images/challenge_fatburn_3d.png'),
  purple: require('../assets/images/challenge_purple_3d.png'),
  runner: require('../assets/images/challenge_rebuild_3d.png'),
  gold: require('../assets/images/challenge_gold_3d.png'),
  green: require('../assets/images/challenge_green_3d.png'),
  orange: require('../assets/images/challenge_orange_3d.png'),
  pink: require('../assets/images/challenge_pink_3d.png'),
  indigo: require('../assets/images/challenge_indigo_3d.png'),
  cyan: require('../assets/images/challenge_cyan_3d.png'),
  teal: require('../assets/images/challenge_teal_3d.png'),
};

// ==========================================
// REAL 3D EXERCISE VIDEOS (31 Canonical Loops)
// ==========================================
export const EXERCISE_VIDEO_ASSETS: Record<string, any> = {
  // Legacy alias
  barbell_press: require('../assets/videos/barbell_press.mp4'),

  // Chest (Canonical & File Basename Aliases)
  chest_pushups: require('../assets/videos/exercises/chest_standard_pushups.mp4'),
  chest_standard_pushups: require('../assets/videos/exercises/chest_standard_pushups.mp4'),
  chest_incline_press: require('../assets/videos/exercises/chest_incline_dumbbell_press.mp4'),
  chest_incline_dumbbell_press: require('../assets/videos/exercises/chest_incline_dumbbell_press.mp4'),
  chest_flyes: require('../assets/videos/exercises/chest_dumbbell_flyes.mp4'),
  chest_dumbbell_flyes: require('../assets/videos/exercises/chest_dumbbell_flyes.mp4'),
  chest_diamond: require('../assets/videos/exercises/chest_diamond_pushups.mp4'),
  chest_diamond_pushups: require('../assets/videos/exercises/chest_diamond_pushups.mp4'),
  chest_cable_cross: require('../assets/videos/exercises/chest_cable_crossover.mp4'),
  chest_cable_crossover: require('../assets/videos/exercises/chest_cable_crossover.mp4'),
  chest_decline_pushups: require('../assets/videos/exercises/chest_decline_pushups.mp4'),

  // Back (Canonical & File Basename Aliases)
  back_pullups: require('../assets/videos/exercises/back_pullups.mp4'),
  back_db_row: require('../assets/videos/exercises/back_dumbbell_row.mp4'),
  back_dumbbell_row: require('../assets/videos/exercises/back_dumbbell_row.mp4'),
  back_lat_pulldown: require('../assets/videos/exercises/back_lat_pulldown.mp4'),
  back_deadlifts: require('../assets/videos/exercises/back_barbell_deadlift.mp4'),
  back_barbell_deadlift: require('../assets/videos/exercises/back_barbell_deadlift.mp4'),
  back_face_pulls: require('../assets/videos/exercises/back_cable_face_pulls.mp4'),
  back_cable_face_pulls: require('../assets/videos/exercises/back_cable_face_pulls.mp4'),

  // Shoulders (Canonical & File Basename Aliases)
  shoulders_overhead_press: require('../assets/videos/exercises/shoulders_military_press.mp4'),
  shoulders_military_press: require('../assets/videos/exercises/shoulders_military_press.mp4'),
  shoulders_lateral_raise: require('../assets/videos/exercises/shoulders_lateral_raises.mp4'),
  shoulders_lateral_raises: require('../assets/videos/exercises/shoulders_lateral_raises.mp4'),
  shoulders_front_raise: require('../assets/videos/exercises/shoulders_front_plate_raise.mp4'),
  shoulders_front_plate_raise: require('../assets/videos/exercises/shoulders_front_plate_raise.mp4'),
  shoulders_arnold_press: require('../assets/videos/exercises/shoulders_arnold_press.mp4'),
  shoulders_rear_delt_fly: require('../assets/videos/exercises/shoulders_reverse_pec_deck.mp4'),
  shoulders_reverse_pec_deck: require('../assets/videos/exercises/shoulders_reverse_pec_deck.mp4'),
  shoulders_upright_row: require('../assets/videos/exercises/shoulders_upright_row.mp4'),

  // Arms (Canonical & File Basename Aliases)
  arms_bicep_curls: require('../assets/videos/exercises/arms_barbell_bicep_curl.mp4'),
  arms_barbell_bicep_curl: require('../assets/videos/exercises/arms_barbell_bicep_curl.mp4'),
  arms_tricep_dips: require('../assets/videos/exercises/arms_parallel_bar_dips.mp4'),
  arms_parallel_bar_dips: require('../assets/videos/exercises/arms_parallel_bar_dips.mp4'),
  arms_hammer_curls: require('../assets/videos/exercises/arms_hammer_curl.mp4'),
  arms_hammer_curl: require('../assets/videos/exercises/arms_hammer_curl.mp4'),
  arms_overhead_extension: require('../assets/videos/exercises/arms_overhead_triceps_ext.mp4'),
  arms_overhead_triceps_ext: require('../assets/videos/exercises/arms_overhead_triceps_ext.mp4'),
  arms_preacher_curl: require('../assets/videos/exercises/arms_preacher_curl.mp4'),
  arms_triceps_pushdown: require('../assets/videos/exercises/arms_triceps_pushdown.mp4'),
  arms_rope_pushdown: require('../assets/videos/exercises/arms_rope_pushdown.mp4'),

  // Abs (Canonical & File Basename Aliases)
  abs_plank: require('../assets/videos/exercises/abs_forearm_plank.mp4'),
  abs_forearm_plank: require('../assets/videos/exercises/abs_forearm_plank.mp4'),
  abs_bicycle_crunches: require('../assets/videos/exercises/abs_bicycle_crunches.mp4'),
  abs_russian_twists: require('../assets/videos/exercises/abs_russian_twist.mp4'),
  abs_russian_twist: require('../assets/videos/exercises/abs_russian_twist.mp4'),
  abs_hanging_leg_raise: require('../assets/videos/exercises/abs_hanging_leg_raise.mp4'),
  abs_wheel_rollout: require('../assets/videos/exercises/abs_wheel_rollout.mp4'),

  // Legs (Canonical & File Basename Aliases)
  legs_romanian_deadlift: require('../assets/videos/exercises/legs_romanian_deadlift.mp4'),
  legs_bulgarian_split: require('../assets/videos/exercises/legs_bulgarian_split_squat.mp4'),
  legs_bulgarian_split_squat: require('../assets/videos/exercises/legs_bulgarian_split_squat.mp4'),
};

// ==========================================
// 3D EXERCISE THUMBNAIL STILLS
// ==========================================
export const EXERCISE_THUMBNAIL_ASSETS: Record<string, any> = {
  // Chest
  chest_pushups: require('../assets/images/exercise_thumbs/chest_standard_pushups.jpg'),
  chest_standard_pushups: require('../assets/images/exercise_thumbs/chest_standard_pushups.jpg'),
  chest_incline_press: require('../assets/images/exercise_thumbs/chest_incline_dumbbell_press.jpg'),
  chest_incline_dumbbell_press: require('../assets/images/exercise_thumbs/chest_incline_dumbbell_press.jpg'),
  chest_flyes: require('../assets/images/exercise_thumbs/chest_dumbbell_flyes.jpg'),
  chest_dumbbell_flyes: require('../assets/images/exercise_thumbs/chest_dumbbell_flyes.jpg'),
  chest_diamond: require('../assets/images/exercise_thumbs/chest_diamond_pushups.jpg'),
  chest_diamond_pushups: require('../assets/images/exercise_thumbs/chest_diamond_pushups.jpg'),
  chest_cable_cross: require('../assets/images/exercise_thumbs/chest_cable_crossover.jpg'),
  chest_cable_crossover: require('../assets/images/exercise_thumbs/chest_cable_crossover.jpg'),
  chest_decline_pushups: require('../assets/images/exercise_thumbs/chest_decline_pushups.jpg'),

  // Back
  back_pullups: require('../assets/images/exercise_thumbs/back_pullups.jpg'),
  back_db_row: require('../assets/images/exercise_thumbs/back_dumbbell_row.jpg'),
  back_dumbbell_row: require('../assets/images/exercise_thumbs/back_dumbbell_row.jpg'),
  back_lat_pulldown: require('../assets/images/exercise_thumbs/back_lat_pulldown.jpg'),
  back_deadlifts: require('../assets/images/exercise_thumbs/back_barbell_deadlift.jpg'),
  back_barbell_deadlift: require('../assets/images/exercise_thumbs/back_barbell_deadlift.jpg'),
  back_face_pulls: require('../assets/images/exercise_thumbs/back_cable_face_pulls.jpg'),
  back_cable_face_pulls: require('../assets/images/exercise_thumbs/back_cable_face_pulls.jpg'),

  // Shoulders
  shoulders_overhead_press: require('../assets/images/exercise_thumbs/shoulders_military_press.jpg'),
  shoulders_military_press: require('../assets/images/exercise_thumbs/shoulders_military_press.jpg'),
  shoulders_lateral_raise: require('../assets/images/exercise_thumbs/shoulders_lateral_raises.jpg'),
  shoulders_lateral_raises: require('../assets/images/exercise_thumbs/shoulders_lateral_raises.jpg'),
  shoulders_front_raise: require('../assets/images/exercise_thumbs/shoulders_front_plate_raise.jpg'),
  shoulders_front_plate_raise: require('../assets/images/exercise_thumbs/shoulders_front_plate_raise.jpg'),
  shoulders_arnold_press: require('../assets/images/exercise_thumbs/shoulders_arnold_press.jpg'),
  shoulders_rear_delt_fly: require('../assets/images/exercise_thumbs/shoulders_reverse_pec_deck.jpg'),
  shoulders_reverse_pec_deck: require('../assets/images/exercise_thumbs/shoulders_reverse_pec_deck.jpg'),
  shoulders_upright_row: require('../assets/images/exercise_thumbs/shoulders_upright_row.jpg'),

  // Arms
  arms_bicep_curls: require('../assets/images/exercise_thumbs/arms_barbell_bicep_curl.jpg'),
  arms_barbell_bicep_curl: require('../assets/images/exercise_thumbs/arms_barbell_bicep_curl.jpg'),
  arms_tricep_dips: require('../assets/images/exercise_thumbs/arms_parallel_bar_dips.jpg'),
  arms_parallel_bar_dips: require('../assets/images/exercise_thumbs/arms_parallel_bar_dips.jpg'),
  arms_hammer_curls: require('../assets/images/exercise_thumbs/arms_hammer_curl.jpg'),
  arms_hammer_curl: require('../assets/images/exercise_thumbs/arms_hammer_curl.jpg'),
  arms_overhead_extension: require('../assets/images/exercise_thumbs/arms_overhead_triceps_ext.jpg'),
  arms_overhead_triceps_ext: require('../assets/images/exercise_thumbs/arms_overhead_triceps_ext.jpg'),
  arms_preacher_curl: require('../assets/images/exercise_thumbs/arms_preacher_curl.jpg'),
  arms_triceps_pushdown: require('../assets/images/exercise_thumbs/arms_triceps_pushdown.jpg'),
  arms_rope_pushdown: require('../assets/images/exercise_thumbs/arms_rope_pushdown.jpg'),

  // Abs
  abs_plank: require('../assets/images/exercise_thumbs/abs_forearm_plank.jpg'),
  abs_forearm_plank: require('../assets/images/exercise_thumbs/abs_forearm_plank.jpg'),
  abs_bicycle_crunches: require('../assets/images/exercise_thumbs/abs_bicycle_crunches.jpg'),
  abs_russian_twists: require('../assets/images/exercise_thumbs/abs_russian_twist.jpg'),
  abs_russian_twist: require('../assets/images/exercise_thumbs/abs_russian_twist.jpg'),
  abs_hanging_leg_raise: require('../assets/images/exercise_thumbs/abs_hanging_leg_raise.jpg'),
  abs_wheel_rollout: require('../assets/images/exercise_thumbs/abs_wheel_rollout.jpg'),

  // Legs
  legs_romanian_deadlift: require('../assets/images/exercise_thumbs/legs_romanian_deadlift.jpg'),
  legs_bulgarian_split: require('../assets/images/exercise_thumbs/legs_bulgarian_split_squat.jpg'),
  legs_bulgarian_split_squat: require('../assets/images/exercise_thumbs/legs_bulgarian_split_squat.jpg'),
};

// Aliases for exercise IDs from fakeData.ts
const EXERCISE_KEY_MAP: Record<string, string> = {
  // Chest
  'chest-pushups': 'chest_pushups',
  'chest_pushups': 'chest_pushups',
  'standard push-ups': 'chest_pushups',
  'push-ups': 'chest_pushups',
  'ex-3': 'chest_pushups',
  'ex-6': 'chest_pushups',
  'ex-25': 'chest_pushups',

  'chest-incline-press': 'chest_incline_press',
  'incline dumbbell press': 'chest_incline_press',

  'chest-flyes': 'chest_flyes',
  'chest flyes': 'chest_flyes',

  'chest-diamond': 'chest_diamond',
  'diamond push-ups': 'chest_diamond',
  'ex-7': 'chest_diamond',

  'chest-cable-cross': 'chest_cable_cross',
  'cable crossover': 'chest_cable_cross',

  'chest-decline-pushups': 'chest_decline_pushups',
  'decline push-ups': 'chest_decline_pushups',
  'ex-9': 'chest_decline_pushups',

  'wide push-ups': 'chest_pushups',
  'ex-8': 'chest_pushups',
  'isometric chest hold': 'chest_pushups',
  'ex-10': 'chest_pushups',

  // Back
  'back-pullups': 'back_pullups',
  'wide-grip pull-ups': 'back_pullups',
  'pull-ups': 'back_pullups',

  'back-db-row': 'back_db_row',
  'bent-over dumbbell rows': 'back_db_row',

  'back-lat-pulldown': 'back_lat_pulldown',
  'lat pulldowns': 'back_lat_pulldown',

  'back-superman': 'back_face_pulls',
  'superman holds': 'back_face_pulls',
  'cable face pulls': 'back_face_pulls',

  'back-deadlifts': 'back_deadlifts',
  'barbell deadlifts': 'back_deadlifts',

  'back-single-row': 'back_db_row',
  'single-arm dumbbell row': 'back_db_row',

  // Shoulders
  'shoulders-overhead-press': 'shoulders_overhead_press',
  'shoulders-military-press': 'shoulders_overhead_press',
  'press': 'shoulders_overhead_press',
  'overhead dumbbell press': 'shoulders_overhead_press',
  'standing military press': 'shoulders_overhead_press',
  'military press': 'shoulders_overhead_press',

  'shoulders-lateral-raise': 'shoulders_lateral_raise',
  'shoulders-lateral-raises': 'shoulders_lateral_raise',
  'dumbbell seated bent arm lateral': 'shoulders_lateral_raise',
  'dumbbell lateral raises': 'shoulders_lateral_raise',

  'shoulders-front-raise': 'shoulders_front_raise',
  'front plate raises': 'shoulders_front_raise',

  'shoulders-arnold-press': 'shoulders_arnold_press',
  'arnold press': 'shoulders_arnold_press',

  'shoulders-rear-delt-fly': 'shoulders_rear_delt_fly',
  'shoulders-reverse-flyes': 'shoulders_rear_delt_fly',
  'lever seated reverse fly': 'shoulders_rear_delt_fly',
  'rear delt flyes': 'shoulders_rear_delt_fly',
  'reverse pec-deck fly': 'shoulders_rear_delt_fly',

  'shoulders-pike-pushups': 'shoulders_upright_row',
  'pike push-ups': 'shoulders_upright_row',
  'ex-22': 'shoulders_upright_row',

  // Arms
  'arms-bicep-curls': 'arms_bicep_curls',
  'dumbbell bicep curls': 'arms_bicep_curls',
  'barbell bicep curl': 'arms_bicep_curls',
  'doorframe bicep pulls': 'arms_bicep_curls',
  'ex-24': 'arms_bicep_curls',

  'arms-tricep-dips': 'arms_tricep_dips',
  'tricep bench dips': 'arms_tricep_dips',
  'bodyweight tricep dips': 'arms_tricep_dips',
  'ex-21': 'arms_tricep_dips',

  'arms-hammer-curls': 'arms_hammer_curls',
  'hammer curls': 'arms_hammer_curls',

  'arms-overhead-extension': 'arms_overhead_extension',
  'overhead tricep extension': 'arms_overhead_extension',

  'arms-concentration-curl': 'arms_preacher_curl',
  'concentration curls': 'arms_preacher_curl',
  'preacher curl': 'arms_preacher_curl',

  'arms-skull-crushers': 'arms_triceps_pushdown',
  'lying skull crushers': 'arms_triceps_pushdown',
  'triceps rope pushdown': 'arms_rope_pushdown',

  'plank shoulder taps': 'abs_plank',
  'ex-23': 'abs_plank',

  // Abs
  'abs-plank': 'abs_plank',
  'forearm plank hold': 'abs_plank',
  'forearm core plank hold': 'abs_plank',
  'plank hold': 'abs_plank',
  'ex-11': 'abs_plank',

  'abs-crunches': 'abs_bicycle_crunches',
  'standard abdominal crunch': 'abs_bicycle_crunches',
  'abdominal crunch': 'abs_bicycle_crunches',
  'crunches': 'abs_bicycle_crunches',

  'abs-bicycle-crunches': 'abs_bicycle_crunches',
  'bicycle crunches': 'abs_bicycle_crunches',
  'ex-12': 'abs_bicycle_crunches',

  'abs-russian-twists': 'abs_russian_twists',
  'russian twists': 'abs_russian_twists',
  'ex-13': 'abs_russian_twists',

  'abs-hanging-leg-raise': 'abs_hanging_leg_raise',
  'hanging leg raises': 'abs_hanging_leg_raise',
  'leg raises': 'abs_hanging_leg_raise',
  'ex-14': 'abs_hanging_leg_raise',

  'abs-wheel-rollout': 'abs_wheel_rollout',
  'ab wheel rollouts': 'abs_wheel_rollout',

  'abs-mountain-climbers': 'abs_bicycle_crunches',
  'speed mountain climbers': 'abs_bicycle_crunches',
  'mountain climbers': 'abs_bicycle_crunches',
  'ex-4': 'abs_bicycle_crunches',
  'ex-15': 'abs_bicycle_crunches',
  'jumping jacks': 'abs_bicycle_crunches',
  'ex-1': 'abs_bicycle_crunches',
  'burpees': 'chest_pushups',
  'ex-5': 'chest_pushups',

  // Legs
  'legs-squat': 'legs_bulgarian_split',
  'barbell high bar squat': 'legs_bulgarian_split',
  'high bar squat': 'legs_bulgarian_split',
  'legs-air-squats': 'legs_bulgarian_split',
  'bodyweight air squats': 'legs_bulgarian_split',
  'air squats': 'legs_bulgarian_split',
  'bodyweight squats': 'legs_bulgarian_split',
  'squats': 'legs_bulgarian_split',
  'squat': 'legs_bulgarian_split',
  'ex-2': 'legs_bulgarian_split',
  'ex-16': 'legs_bulgarian_split',

  'legs-walking-lunges': 'legs_bulgarian_split',
  'walking lunges': 'legs_bulgarian_split',
  'ex-17': 'legs_bulgarian_split',

  'legs-bulgarian-split': 'legs_bulgarian_split',
  'bulgarian split squats': 'legs_bulgarian_split',

  'legs-romanian-deadlift': 'legs_romanian_deadlift',
  'dumbbell romanian deadlift': 'legs_romanian_deadlift',
  'dumbbell romanian deadlifts': 'legs_romanian_deadlift',
  'romanian deadlift': 'legs_romanian_deadlift',

  'legs-calf-raises': 'back_deadlifts',
  'standing calf raises': 'back_deadlifts',
  'calf raises': 'back_deadlifts',
  'ex-19': 'back_deadlifts',

  'legs-wall-sit': 'legs_bulgarian_split',
  'wall sit hold': 'legs_bulgarian_split',
  'wall sit': 'legs_bulgarian_split',
  'ex-20': 'legs_bulgarian_split',
  'glute bridges': 'legs_romanian_deadlift',
  'ex-18': 'legs_romanian_deadlift',
  'push-up burnout': 'chest_decline_pushups',

  // Exact file basename aliases to canonical keys
  'chest_standard_pushups': 'chest_pushups',
  'chest_incline_dumbbell_press': 'chest_incline_press',
  'chest_diamond_pushups': 'chest_diamond',
  'chest_dumbbell_flyes': 'chest_flyes',
  'chest_cable_crossover': 'chest_cable_cross',
  'chest_decline_pushups': 'chest_decline_pushups',
  'back_barbell_deadlift': 'back_deadlifts',
  'back_cable_face_pulls': 'back_face_pulls',
  'back_dumbbell_row': 'back_db_row',
  'back_lat_pulldown': 'back_lat_pulldown',
  'back_pullups': 'back_pullups',
  'shoulders_military_press': 'shoulders_overhead_press',
  'shoulders_lateral_raises': 'shoulders_lateral_raise',
  'shoulders_front_plate_raise': 'shoulders_front_raise',
  'shoulders_arnold_press': 'shoulders_arnold_press',
  'shoulders_reverse_pec_deck': 'shoulders_rear_delt_fly',
  'shoulders_upright_row': 'shoulders_upright_row',
  'arms_barbell_bicep_curl': 'arms_bicep_curls',
  'arms_parallel_bar_dips': 'arms_tricep_dips',
  'arms_hammer_curl': 'arms_hammer_curls',
  'arms_overhead_triceps_ext': 'arms_overhead_extension',
  'arms_preacher_curl': 'arms_preacher_curl',
  'arms_triceps_pushdown': 'arms_triceps_pushdown',
  'arms_rope_pushdown': 'arms_rope_pushdown',
  'abs_forearm_plank': 'abs_plank',
  'abs_bicycle_crunches': 'abs_bicycle_crunches',
  'abs_russian_twist': 'abs_russian_twists',
  'abs_hanging_leg_raise': 'abs_hanging_leg_raise',
  'abs_wheel_rollout': 'abs_wheel_rollout',
  'legs_bulgarian_split_squat': 'legs_bulgarian_split',
  'legs_romanian_deadlift': 'legs_romanian_deadlift',
};

/**
 * Extracts a normalized exercise key from any input (ID, name, URL, filename).
 */
export function normalizeExerciseKey(input?: string | null): string {
  if (!input) return '';
  let str = String(input).trim();
  // Strip URL query parameters or hash
  str = str.split('?')[0].split('#')[0];
  // If it contains a slash, extract the last filename part
  if (str.includes('/') || str.includes('\\')) {
    const parts = str.split(/[/\\]/);
    str = parts[parts.length - 1];
  }
  // Remove video/image extensions
  str = str.replace(/\.(mp4|jpg|jpeg|png|webp|mov)$/i, '');
  // Normalize hyphens and spaces to underscores so canonical IDs match asset keys directly
  return str.toLowerCase().replace(/[-\s]+/g, '_').trim();
}

/**
 * Helper to get a category-matched fallback key so non-chest exercises never default to pushups
 */
export function getCategoryFallbackKey(str: string, bodyPart?: string): string {
  const bp = (bodyPart || '').toLowerCase();
  if (bp.includes('leg')) return 'legs_bulgarian_split';
  if (bp.includes('ab') || bp.includes('core')) return 'abs_plank';
  if (bp.includes('shoulder')) return 'shoulders_overhead_press';
  if (bp.includes('arm')) return 'arms_bicep_curls';
  if (bp.includes('back')) return 'back_pullups';
  if (bp.includes('chest')) return 'chest_pushups';

  const s = str.toLowerCase();
  if (s.includes('squat') || s.includes('lunge') || s.includes('leg') || s.includes('calf') || s.includes('wall sit')) {
    return 'legs_bulgarian_split';
  }
  if (
    s.includes('plank') ||
    s.includes('abs') ||
    s.includes('crunch') ||
    s.includes('twist') ||
    s.includes('core') ||
    s.includes('rollout') ||
    s.includes('climber')
  ) {
    return 'abs_plank';
  }
  if (
    s.includes('shoulder') ||
    s.includes('press') ||
    s.includes('delt') ||
    s.includes('overhead') ||
    s.includes('raise') ||
    s.includes('pike')
  ) {
    return 'shoulders_overhead_press';
  }
  if (
    s.includes('arm') ||
    s.includes('bicep') ||
    s.includes('tricep') ||
    s.includes('curl') ||
    s.includes('dip')
  ) {
    return 'arms_bicep_curls';
  }
  if (
    s.includes('back') ||
    s.includes('row') ||
    s.includes('lat') ||
    s.includes('pull') ||
    s.includes('deadlift')
  ) {
    return 'back_pullups';
  }
  return 'chest_pushups';
}

/**
 * Returns the video asset for an exercise ID or name.
 * Delivers ultra-reliable HTTPS Cloudinary streaming video assets with local fallback,
 * ensuring instant, crash-proof playback across Android, iOS, Expo Go, and production builds.
 */
export function getExerciseVideoAsset(identifier?: string | any, bodyPart?: string): any {
  if (typeof identifier === 'number') {
    return identifier;
  }
  if (typeof identifier === 'string' && identifier.startsWith('http') && !identifier.includes('commondatastorage.googleapis.com')) {
    return identifier;
  }

  const raw = String(identifier || '').trim();
  const cleanKey = normalizeExerciseKey(raw);
  const mappedKey = EXERCISE_KEY_MAP[cleanKey] || cleanKey;
  const catKey = getCategoryFallbackKey(cleanKey || raw, bodyPart);

  // 1. Cloudinary CDN URL - 100% reliable HTTPS playback across Expo Go, Android, iOS
  const cloudinaryVideos = (cloudinaryAssets.videos as Record<string, string>) || {};
  const cdnUrl =
    cloudinaryVideos[mappedKey] ||
    cloudinaryVideos[cleanKey] ||
    cloudinaryVideos[raw] ||
    cloudinaryVideos[catKey];
  if (cdnUrl) {
    return cdnUrl;
  }

  // 2. Direct local bundled asset fallback
  if (raw && EXERCISE_VIDEO_ASSETS[raw]) {
    return EXERCISE_VIDEO_ASSETS[raw];
  }
  if (EXERCISE_VIDEO_ASSETS[cleanKey]) {
    return EXERCISE_VIDEO_ASSETS[cleanKey];
  }
  if (EXERCISE_VIDEO_ASSETS[mappedKey]) {
    return EXERCISE_VIDEO_ASSETS[mappedKey];
  }
  if (EXERCISE_VIDEO_ASSETS[catKey]) {
    return EXERCISE_VIDEO_ASSETS[catKey];
  }

  return cloudinaryVideos['chest_pushups'] || EXERCISE_VIDEO_ASSETS.chest_pushups;
}

/**
 * Returns the video asset for an exercise identifier, guaranteed to work across all platforms.
 */
export function getExerciseLocalVideoAsset(identifier?: string | any, bodyPart?: string): any {
  return getExerciseVideoAsset(identifier, bodyPart);
}

/**
 * Returns the matching thumbnail image asset for an exercise ID or name.
 * Uses local bundled thumbnail first, then Cloudinary thumbnail if available.
 */
export function getExerciseThumbnailAsset(
  identifier?: string | any,
  fallbackUrl?: string,
  bodyPart?: string
): any {
  if (typeof identifier === 'number') {
    return identifier;
  }
  const bp = (bodyPart || '').toLowerCase();
  const catKey = getCategoryFallbackKey(String(identifier || ''), bodyPart);
  const defaultThumb =
    EXERCISE_THUMBNAIL_ASSETS[catKey] ||
    (bodyPart ? getExercise3DAsset(bodyPart) : EXERCISE_THUMBNAIL_ASSETS.chest_pushups);

  if (typeof identifier === 'string') {
    const raw = identifier.trim();

    // Check direct local bundled thumbnail first if not an HTTP URL
    if (!raw.startsWith('http')) {
      const cleanKey = normalizeExerciseKey(raw);
      const mappedKey = EXERCISE_KEY_MAP[cleanKey] || cleanKey;

      if (EXERCISE_THUMBNAIL_ASSETS[raw]) {
        return EXERCISE_THUMBNAIL_ASSETS[raw];
      }
      if (EXERCISE_THUMBNAIL_ASSETS[cleanKey]) {
        return EXERCISE_THUMBNAIL_ASSETS[cleanKey];
      }
      if (EXERCISE_THUMBNAIL_ASSETS[mappedKey]) {
        return EXERCISE_THUMBNAIL_ASSETS[mappedKey];
      }

      // Check Cloudinary CDN verified URL
      const cloudinaryThumb =
        (cloudinaryAssets.images as Record<string, string>)?.[mappedKey] ||
        (cloudinaryAssets.images as Record<string, string>)?.[cleanKey] ||
        (cloudinaryAssets.images as Record<string, string>)?.[raw];
      if (cloudinaryThumb) {
        return { uri: cloudinaryThumb };
      }

      // Category-aware local fallback
      if (EXERCISE_THUMBNAIL_ASSETS[catKey]) {
        return EXERCISE_THUMBNAIL_ASSETS[catKey];
      }
    }
  }

  // Fallback URL (discard generic push-up photo on non-chest exercises)
  if (fallbackUrl && typeof fallbackUrl === 'string') {
    const isPushupPhoto = fallbackUrl.includes('1598971639058');
    if (!(isPushupPhoto && bp && !bp.includes('chest'))) {
      if (fallbackUrl.startsWith('http') && !fallbackUrl.endsWith('.mp4')) {
        return { uri: fallbackUrl };
      }
    }
  }

  return defaultThumb;
}

export function getExercise3DAsset(bodyPart: string, fallbackUrl?: string) {
  if (fallbackUrl) {
    const specificThumb = getExerciseThumbnailAsset(fallbackUrl);
    if (specificThumb && specificThumb !== EXERCISE_THUMBNAIL_ASSETS.chest_pushups) {
      return specificThumb;
    }
    if (fallbackUrl.startsWith('http')) {
      return { uri: fallbackUrl };
    }
  }
  if (!bodyPart) return EXERCISE_3D_ASSETS['Full Body'];

  // Normalize case (e.g. 'SHOULDER' -> 'Shoulders', 'ABDOMEN' -> 'Abs')
  const bp = bodyPart.toLowerCase();
  if (bp.includes('shoulder')) return EXERCISE_3D_ASSETS.Shoulders;
  if (bp.includes('chest')) return EXERCISE_3D_ASSETS.Chest;
  if (bp.includes('back')) return EXERCISE_3D_ASSETS.Back;
  if (bp.includes('arm')) return EXERCISE_3D_ASSETS.Arms;
  if (bp.includes('leg')) return EXERCISE_3D_ASSETS.Legs;
  if (bp.includes('ab') || bp.includes('core')) return EXERCISE_3D_ASSETS.Abs;

  if (EXERCISE_3D_ASSETS[bodyPart]) {
    return EXERCISE_3D_ASSETS[bodyPart];
  }
  return EXERCISE_3D_ASSETS['Full Body'];
}

export interface AnatomyRailItem {
  name: string;
  image: any;
}

export function getMuscleThumbnailsForBodyPart(bodyPart: string): AnatomyRailItem[] {
  const bp = (bodyPart || '').toLowerCase();
  if (bp.includes('chest')) {
    return [
      { name: 'Pectoralis Major', image: ANATOMY_THUMBNAILS.chest },
      { name: 'Anterior Delts', image: ANATOMY_THUMBNAILS.anteriorDeltoids },
      { name: 'Triceps Brachii', image: ANATOMY_THUMBNAILS.triceps },
    ];
  }
  if (bp.includes('back')) {
    return [
      { name: 'Latissimus Dorsi', image: ANATOMY_THUMBNAILS.back },
      { name: 'Trapezius', image: ANATOMY_3D_ASSETS.posterior },
      { name: 'Biceps Brachii', image: ANATOMY_THUMBNAILS.biceps },
    ];
  }
  if (bp.includes('arm')) {
    return [
      { name: 'Biceps Brachii', image: ANATOMY_THUMBNAILS.biceps },
      { name: 'Triceps Brachii', image: ANATOMY_THUMBNAILS.triceps },
      { name: 'Forearms / Grip', image: ANATOMY_THUMBNAILS.forearms },
    ];
  }
  if (bp.includes('leg')) {
    return [
      { name: 'Quadriceps', image: EXERCISE_3D_ASSETS.Legs },
      { name: 'Hamstrings / Glutes', image: ANATOMY_3D_ASSETS.posterior },
      { name: 'Calves', image: EXERCISE_3D_ASSETS.Legs },
    ];
  }
  if (bp.includes('ab') || bp.includes('core')) {
    return [
      { name: 'Rectus Abdominis', image: EXERCISE_3D_ASSETS.Abs },
      { name: 'Obliques', image: ANATOMY_3D_ASSETS.anterior },
      { name: 'Transverse Core', image: EXERCISE_3D_ASSETS.Abs },
    ];
  }
  // Default: Shoulders
  return [
    { name: 'Anterior Deltoids', image: ANATOMY_THUMBNAILS.anteriorDeltoids },
    { name: 'Front Delts', image: ANATOMY_THUMBNAILS.frontDelts },
    { name: 'Shoulders Rail', image: ANATOMY_THUMBNAILS.shoulders },
  ];
}

