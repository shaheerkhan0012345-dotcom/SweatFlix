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

export function getExercise3DAsset(bodyPart: string, fallbackUrl?: string) {
  if (EXERCISE_3D_ASSETS[bodyPart]) {
    return EXERCISE_3D_ASSETS[bodyPart];
  }
  if (fallbackUrl) {
    return { uri: fallbackUrl };
  }
  return EXERCISE_3D_ASSETS['Full Body'];
}
