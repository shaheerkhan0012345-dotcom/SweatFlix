import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { BodyPartType } from '../data/fakeData';

export interface AnatomyBodyMapProps {
  bodyPart: BodyPartType | string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  height?: number;
  width?: number;
  showToggle?: boolean;
}

// Maps high-level body parts to specific muscular groups
const MUSCLE_MAPPINGS: Record<
  string,
  {
    primary: string[];
    secondary: string[];
    defaultView: 'front' | 'back';
  }
> = {
  Chest: {
    primary: ['chest'],
    secondary: ['front_delts', 'triceps'],
    defaultView: 'front',
  },
  Back: {
    primary: ['lats', 'upper_back'],
    secondary: ['biceps', 'rear_delts'],
    defaultView: 'back',
  },
  Shoulders: {
    primary: ['deltoids', 'front_delts'],
    secondary: ['triceps', 'upper_back'],
    defaultView: 'front',
  },
  Arms: {
    primary: ['biceps', 'triceps'],
    secondary: ['forearms', 'deltoids'],
    defaultView: 'front',
  },
  Abs: {
    primary: ['abs', 'obliques'],
    secondary: ['quads'],
    defaultView: 'front',
  },
  Legs: {
    primary: ['quads', 'hamstrings'],
    secondary: ['glutes', 'calves'],
    defaultView: 'front',
  },
  'Full Body': {
    primary: ['chest', 'quads'],
    secondary: ['abs', 'deltoids', 'lats'],
    defaultView: 'front',
  },
};

export const AnatomyBodyMap: React.FC<AnatomyBodyMapProps> = ({
  bodyPart,
  primaryMuscles,
  secondaryMuscles,
  height = 240,
  width = 160,
  showToggle = true,
}) => {
  const mapping = MUSCLE_MAPPINGS[bodyPart] || MUSCLE_MAPPINGS['Full Body'];

  const initialView = useMemo<'front' | 'back'>(() => {
    if (bodyPart === 'Back') return 'back';
    return mapping.defaultView;
  }, [bodyPart, mapping.defaultView]);

  const [activeView, setActiveView] = useState<'front' | 'back'>(initialView);

  const activePrimary = primaryMuscles || mapping.primary;
  const activeSecondary = secondaryMuscles || mapping.secondary;

  const getMuscleColor = (muscleId: string) => {
    if (activePrimary.some((m) => m.toLowerCase().includes(muscleId) || muscleId.includes(m.toLowerCase()))) {
      return Colors.primary; // '#E5252A'
    }
    if (activeSecondary.some((m) => m.toLowerCase().includes(muscleId) || muscleId.includes(m.toLowerCase()))) {
      return Colors.accent; // '#FF8A1F'
    }
    return '#E2E8F0'; // clean neutral muscle
  };

  const getMuscleStroke = (muscleId: string) => {
    if (activePrimary.some((m) => m.toLowerCase().includes(muscleId) || muscleId.includes(m.toLowerCase()))) {
      return '#B31B1F';
    }
    if (activeSecondary.some((m) => m.toLowerCase().includes(muscleId) || muscleId.includes(m.toLowerCase()))) {
      return '#D97210';
    }
    return '#CBD5E1';
  };

  return (
    <View style={styles.container}>
      {/* Front / Back Toggle Buttons */}
      {showToggle && (
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeView === 'front' && styles.toggleBtnActive,
            ]}
            onPress={() => setActiveView('front')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                activeView === 'front' && styles.toggleBtnTextActive,
              ]}
            >
              Anterior (Front)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeView === 'back' && styles.toggleBtnActive,
            ]}
            onPress={() => setActiveView('back')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                activeView === 'back' && styles.toggleBtnTextActive,
              ]}
            >
              Posterior (Back)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SVG Muscular Human Body Graphic */}
      <View style={[styles.canvasWrapper, { height, width: width * 1.3 }]}>
        <Svg viewBox="0 0 200 320" width={width * 1.3} height={height}>
          <Defs>
            <LinearGradient id="glowRed" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FF4D4D" stopOpacity="1" />
              <Stop offset="100%" stopColor="#C4151B" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="glowOrange" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFA64D" stopOpacity="1" />
              <Stop offset="100%" stopColor="#E67300" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Underlay Body Frame / Shadow */}
          <Circle cx="100" cy="28" r="16" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="2" />
          <Rect x="93" y="42" width="14" height="12" rx="3" fill="#F1F5F9" />

          {activeView === 'front' ? (
            /* ================= FRONT ANTERIOR MUSCLE MAP ================= */
            <G>
              {/* Head & Neck */}
              <Circle cx="100" cy="28" r="15" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
              <Path d="M92 42 Q100 45 108 42 L106 54 Q100 56 94 54 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />

              {/* Shoulders / Deltoids (Left & Right) */}
              <Path
                d="M62 58 C52 64 50 78 54 88 C60 88 66 80 72 74 C70 66 66 60 62 58 Z"
                fill={getMuscleColor('deltoids')}
                stroke={getMuscleStroke('deltoids')}
                strokeWidth="1.5"
              />
              <Path
                d="M138 58 C148 64 150 78 146 88 C140 88 134 80 128 74 C130 66 134 60 138 58 Z"
                fill={getMuscleColor('deltoids')}
                stroke={getMuscleStroke('deltoids')}
                strokeWidth="1.5"
              />

              {/* Chest / Pectoralis Major */}
              {/* Left Pec */}
              <Path
                d="M72 64 C82 62 98 64 99 74 C99 92 82 96 70 88 C68 78 70 68 72 64 Z"
                fill={getMuscleColor('chest')}
                stroke={getMuscleStroke('chest')}
                strokeWidth="1.5"
              />
              {/* Right Pec */}
              <Path
                d="M128 64 C118 62 102 64 101 74 C101 92 118 96 130 88 C132 78 130 68 128 64 Z"
                fill={getMuscleColor('chest')}
                stroke={getMuscleStroke('chest')}
                strokeWidth="1.5"
              />

              {/* Biceps (Left & Right) */}
              <Path
                d="M52 90 C46 98 48 116 54 122 C59 122 62 114 62 104 C62 94 56 90 52 90 Z"
                fill={getMuscleColor('biceps')}
                stroke={getMuscleStroke('biceps')}
                strokeWidth="1.5"
              />
              <Path
                d="M148 90 C154 98 152 116 146 122 C141 122 138 114 138 104 C138 94 144 90 148 90 Z"
                fill={getMuscleColor('biceps')}
                stroke={getMuscleStroke('biceps')}
                strokeWidth="1.5"
              />

              {/* Forearms */}
              <Path
                d="M52 124 C44 136 40 154 44 162 C48 162 52 152 56 140 C56 130 54 124 52 124 Z"
                fill={getMuscleColor('forearms')}
                stroke={getMuscleStroke('forearms')}
                strokeWidth="1.2"
              />
              <Path
                d="M148 124 C156 136 160 154 156 162 C152 162 148 152 144 140 C144 130 146 124 148 124 Z"
                fill={getMuscleColor('forearms')}
                stroke={getMuscleStroke('forearms')}
                strokeWidth="1.2"
              />

              {/* Rectus Abdominis / Core (6-pack blocks) */}
              {/* Upper Abs */}
              <Rect x="86" y="94" width="12" height="11" rx="2" fill={getMuscleColor('abs')} stroke={getMuscleStroke('abs')} strokeWidth="1" />
              <Rect x="102" y="94" width="12" height="11" rx="2" fill={getMuscleColor('abs')} stroke={getMuscleStroke('abs')} strokeWidth="1" />
              {/* Mid Abs */}
              <Rect x="86" y="108" width="12" height="11" rx="2" fill={getMuscleColor('abs')} stroke={getMuscleStroke('abs')} strokeWidth="1" />
              <Rect x="102" y="108" width="12" height="11" rx="2" fill={getMuscleColor('abs')} stroke={getMuscleStroke('abs')} strokeWidth="1" />
              {/* Lower Abs */}
              <Path
                d="M86 122 H114 L110 138 Q100 144 90 138 Z"
                fill={getMuscleColor('abs')}
                stroke={getMuscleStroke('abs')}
                strokeWidth="1"
              />

              {/* Obliques */}
              <Path
                d="M72 96 C70 110 74 126 82 136 C80 126 78 110 82 98 Z"
                fill={getMuscleColor('obliques')}
                stroke={getMuscleStroke('obliques')}
                strokeWidth="1"
              />
              <Path
                d="M128 96 C130 110 126 126 118 136 C120 126 122 110 118 98 Z"
                fill={getMuscleColor('obliques')}
                stroke={getMuscleStroke('obliques')}
                strokeWidth="1"
              />

              {/* Pelvis / Hips */}
              <Path d="M84 140 Q100 146 116 140 L114 154 Q100 156 86 154 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />

              {/* Quadriceps / Thighs */}
              {/* Left Quad */}
              <Path
                d="M78 156 C68 174 68 206 74 226 C82 226 94 216 96 186 C96 166 90 156 78 156 Z"
                fill={getMuscleColor('quads')}
                stroke={getMuscleStroke('quads')}
                strokeWidth="1.5"
              />
              {/* Right Quad */}
              <Path
                d="M122 156 C132 174 132 206 126 226 C118 226 106 216 104 186 C104 166 110 156 122 156 Z"
                fill={getMuscleColor('quads')}
                stroke={getMuscleStroke('quads')}
                strokeWidth="1.5"
              />

              {/* Knees */}
              <Circle cx="80" cy="234" r="5" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
              <Circle cx="120" cy="234" r="5" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />

              {/* Calves (Front Shin / Anterior) */}
              <Path
                d="M76 242 C70 256 72 284 76 296 C82 296 86 280 84 254 C84 246 80 242 76 242 Z"
                fill={getMuscleColor('calves')}
                stroke={getMuscleStroke('calves')}
                strokeWidth="1.2"
              />
              <Path
                d="M124 242 C130 256 128 284 124 296 C118 296 114 280 116 254 C116 246 120 242 124 242 Z"
                fill={getMuscleColor('calves')}
                stroke={getMuscleStroke('calves')}
                strokeWidth="1.2"
              />

              {/* Feet */}
              <Path d="M72 298 Q80 306 90 302 L84 298 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
              <Path d="M128 298 Q120 306 110 302 L116 298 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
            </G>
          ) : (
            /* ================= BACK POSTERIOR MUSCLE MAP ================= */
            <G>
              {/* Head & Neck */}
              <Circle cx="100" cy="28" r="15" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1.5" />
              {/* Trapezius / Upper Back */}
              <Path
                d="M84 46 C92 42 108 42 116 46 L124 64 C112 74 88 74 76 64 Z"
                fill={getMuscleColor('traps')}
                stroke={getMuscleStroke('traps')}
                strokeWidth="1.5"
              />

              {/* Rear Deltoids */}
              <Path
                d="M60 58 C50 64 50 78 54 86 C60 86 68 76 74 70 Z"
                fill={getMuscleColor('deltoids')}
                stroke={getMuscleStroke('deltoids')}
                strokeWidth="1.5"
              />
              <Path
                d="M140 58 C150 64 150 78 146 86 C140 86 132 76 126 70 Z"
                fill={getMuscleColor('deltoids')}
                stroke={getMuscleStroke('deltoids')}
                strokeWidth="1.5"
              />

              {/* Triceps (Left & Right) */}
              <Path
                d="M52 88 C46 96 46 114 52 122 C58 122 62 112 62 100 C62 92 56 88 52 88 Z"
                fill={getMuscleColor('triceps')}
                stroke={getMuscleStroke('triceps')}
                strokeWidth="1.5"
              />
              <Path
                d="M148 88 C154 96 154 114 148 122 C142 122 138 112 138 100 C138 92 144 88 148 88 Z"
                fill={getMuscleColor('triceps')}
                stroke={getMuscleStroke('triceps')}
                strokeWidth="1.5"
              />

              {/* Latissimus Dorsi (Lats) */}
              {/* Left Lat */}
              <Path
                d="M74 74 C86 78 96 90 98 120 C88 124 74 112 68 94 C68 84 70 76 74 74 Z"
                fill={getMuscleColor('lats')}
                stroke={getMuscleStroke('lats')}
                strokeWidth="1.5"
              />
              {/* Right Lat */}
              <Path
                d="M126 74 C114 78 104 90 102 120 C112 124 126 112 132 94 C132 84 130 76 126 74 Z"
                fill={getMuscleColor('lats')}
                stroke={getMuscleStroke('lats')}
                strokeWidth="1.5"
              />

              {/* Lower Back / Erector Spinae */}
              <Path
                d="M92 118 H108 L104 140 H96 Z"
                fill={getMuscleColor('lower_back')}
                stroke={getMuscleStroke('lower_back')}
                strokeWidth="1.2"
              />

              {/* Gluteus Maximus (Glutes) */}
              {/* Left Glute */}
              <Path
                d="M76 144 C82 142 96 144 98 152 C98 174 80 182 72 170 C70 158 72 148 76 144 Z"
                fill={getMuscleColor('glutes')}
                stroke={getMuscleStroke('glutes')}
                strokeWidth="1.5"
              />
              {/* Right Glute */}
              <Path
                d="M124 144 C118 142 104 144 102 152 C102 174 120 182 128 170 C130 158 128 148 124 144 Z"
                fill={getMuscleColor('glutes')}
                stroke={getMuscleStroke('glutes')}
                strokeWidth="1.5"
              />

              {/* Hamstrings (Back of Thighs) */}
              {/* Left Hamstring */}
              <Path
                d="M74 176 C68 194 68 214 74 228 C82 228 94 218 96 196 C96 182 86 176 74 176 Z"
                fill={getMuscleColor('hamstrings')}
                stroke={getMuscleStroke('hamstrings')}
                strokeWidth="1.5"
              />
              {/* Right Hamstring */}
              <Path
                d="M126 176 C132 194 132 214 126 228 C118 228 106 218 104 196 C104 182 114 176 126 176 Z"
                fill={getMuscleColor('hamstrings')}
                stroke={getMuscleStroke('hamstrings')}
                strokeWidth="1.5"
              />

              {/* Calves (Gastrocnemius & Soleus) */}
              <Path
                d="M72 238 C64 252 66 276 74 294 C82 294 88 276 86 250 C86 242 80 238 72 238 Z"
                fill={getMuscleColor('calves')}
                stroke={getMuscleStroke('calves')}
                strokeWidth="1.5"
              />
              <Path
                d="M128 238 C136 252 134 276 126 294 C118 294 112 276 114 250 C114 242 120 238 128 238 Z"
                fill={getMuscleColor('calves')}
                stroke={getMuscleStroke('calves')}
                strokeWidth="1.5"
              />

              {/* Feet Posterior */}
              <Path d="M72 298 Q80 304 88 300 L84 296 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
              <Path d="M128 298 Q120 304 112 300 L116 296 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
            </G>
          )}
        </Svg>
      </View>

      {/* Muscle Legend Pills */}
      <View style={styles.legendWrap}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendTitle}>Target:</Text>
          <Text style={styles.legendValue}>
            {activePrimary.join(', ').toUpperCase()}
          </Text>
        </View>

        {activeSecondary.length > 0 && (
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.legendTitle}>Supporting:</Text>
            <Text style={styles.legendValue}>
              {activeSecondary.join(', ').toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.card,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#EBEBEB',
    borderRadius: 20,
    padding: 3,
    marginBottom: Spacing.xs,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 18,
  },
  toggleBtnActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semiBold,
    color: Colors.textGrey,
  },
  toggleBtnTextActive: {
    color: Colors.textDark,
    fontWeight: Typography.weights.bold,
  },
  canvasWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  legendWrap: {
    width: '100%',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    gap: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendTitle: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
    marginRight: 4,
  },
  legendValue: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
    color: Colors.textGrey,
    flex: 1,
  },
});
