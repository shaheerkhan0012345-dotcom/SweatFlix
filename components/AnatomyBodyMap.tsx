import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { BodyPartType } from '../data/fakeData';
import { ANATOMY_3D_ASSETS } from '../constants/exerciseImages';

export interface AnatomyBodyMapProps {
  bodyPart: BodyPartType | string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  height?: number;
  width?: number;
  showToggle?: boolean;
}

export function normalizeBodyPart(bodyPart?: string): string {
  if (!bodyPart) return 'Full Body';
  const bp = String(bodyPart).toLowerCase().trim();
  if (bp.includes('shoulder') || bp.includes('delt')) return 'Shoulders';
  if (bp.includes('chest') || bp.includes('pec')) return 'Chest';
  if (bp.includes('back') || bp.includes('lat') || bp.includes('trap')) return 'Back';
  if (bp.includes('bicep')) return 'Biceps';
  if (bp.includes('tricep')) return 'Triceps';
  if (bp.includes('forearm')) return 'Forearms';
  if (bp.includes('arm')) return 'Arms';
  if (bp.includes('ab') || bp.includes('core')) return 'Abs';
  if (bp.includes('leg') || bp.includes('quad') || bp.includes('hamstring') || bp.includes('glute') || bp.includes('calf')) return 'Legs';
  return 'Full Body';
}

function get3DMuscleAsset(normalizedBp: string): any {
  switch (normalizedBp) {
    case 'Shoulders':
      return ANATOMY_3D_ASSETS.shoulder;
    case 'Chest':
      return ANATOMY_3D_ASSETS.chest;
    case 'Back':
      return ANATOMY_3D_ASSETS.back;
    case 'Biceps':
      return ANATOMY_3D_ASSETS.biceps;
    case 'Triceps':
      return ANATOMY_3D_ASSETS.triceps;
    case 'Forearms':
      return ANATOMY_3D_ASSETS.forearms;
    case 'Arms':
      return ANATOMY_3D_ASSETS.biceps;
    case 'Abs':
      return ANATOMY_3D_ASSETS.abs;
    case 'Legs':
      return ANATOMY_3D_ASSETS.legs;
    default:
      return ANATOMY_3D_ASSETS.anterior;
  }
}

interface MuscleCallout {
  name: string;
  category: 'primary' | 'secondary';
  top: `${number}%`;
  left?: `${number}%`;
  right?: `${number}%`;
}

const BODY_PART_CALLOUTS: Record<
  string,
  {
    front: MuscleCallout[];
    back: MuscleCallout[];
    defaultView: 'front' | 'back';
  }
> = {
  Chest: {
    defaultView: 'front',
    front: [
      { name: 'Pectoralis Major', category: 'primary', top: '24%', left: '8%' },
      { name: 'Anterior Deltoid', category: 'secondary', top: '20%', right: '8%' },
      { name: 'Serratus Anterior', category: 'secondary', top: '34%', left: '8%' },
    ],
    back: [
      { name: 'Rhomboids', category: 'secondary', top: '24%', right: '8%' },
      { name: 'Trapezius', category: 'secondary', top: '16%', left: '8%' },
    ],
  },
  Back: {
    defaultView: 'back',
    front: [
      { name: 'Core Stabilizers', category: 'secondary', top: '38%', left: '8%' },
      { name: 'Biceps Brachii', category: 'secondary', top: '28%', right: '8%' },
    ],
    back: [
      { name: 'Latissimus Dorsi', category: 'primary', top: '28%', left: '8%' },
      { name: 'Trapezius (Upper/Mid)', category: 'primary', top: '16%', right: '8%' },
      { name: 'Erector Spinae', category: 'secondary', top: '40%', left: '8%' },
      { name: 'Posterior Deltoids', category: 'secondary', top: '20%', right: '8%' },
    ],
  },
  Shoulders: {
    defaultView: 'front',
    front: [
      { name: 'Anterior Deltoid', category: 'primary', top: '19%', left: '8%' },
      { name: 'Lateral Deltoid', category: 'primary', top: '22%', right: '8%' },
      { name: 'Clavicular Head', category: 'secondary', top: '16%', left: '8%' },
    ],
    back: [
      { name: 'Posterior Deltoid', category: 'primary', top: '20%', left: '8%' },
      { name: 'Trapezius Upper', category: 'secondary', top: '15%', right: '8%' },
    ],
  },
  Arms: {
    defaultView: 'front',
    front: [
      { name: 'Biceps Brachii', category: 'primary', top: '28%', left: '8%' },
      { name: 'Brachialis', category: 'primary', top: '32%', right: '8%' },
      { name: 'Forearm Flexors', category: 'secondary', top: '40%', left: '8%' },
    ],
    back: [
      { name: 'Triceps Long Head', category: 'primary', top: '26%', right: '8%' },
      { name: 'Triceps Lateral Head', category: 'primary', top: '30%', left: '8%' },
      { name: 'Forearm Extensors', category: 'secondary', top: '42%', right: '8%' },
    ],
  },
  Abs: {
    defaultView: 'front',
    front: [
      { name: 'Rectus Abdominis', category: 'primary', top: '32%', left: '8%' },
      { name: 'External Obliques', category: 'primary', top: '38%', right: '8%' },
      { name: 'Transverse Abdominis', category: 'secondary', top: '44%', left: '8%' },
    ],
    back: [
      { name: 'Thoracolumbar Fascia', category: 'secondary', top: '38%', right: '8%' },
      { name: 'Erector Spinae', category: 'secondary', top: '42%', left: '8%' },
    ],
  },
  Legs: {
    defaultView: 'front',
    front: [
      { name: 'Quadriceps Femoris', category: 'primary', top: '56%', left: '8%' },
      { name: 'Vastus Medialis', category: 'primary', top: '64%', right: '8%' },
      { name: 'Tibialis Anterior', category: 'secondary', top: '78%', left: '8%' },
    ],
    back: [
      { name: 'Gluteus Maximus', category: 'primary', top: '48%', right: '8%' },
      { name: 'Biceps Femoris (Hamstrings)', category: 'primary', top: '60%', left: '8%' },
      { name: 'Gastrocnemius (Calves)', category: 'secondary', top: '76%', right: '8%' },
    ],
  },
  'Full Body': {
    defaultView: 'front',
    front: [
      { name: 'Pectoralis', category: 'primary', top: '24%', left: '8%' },
      { name: 'Rectus Abdominis', category: 'primary', top: '34%', right: '8%' },
      { name: 'Quadriceps', category: 'primary', top: '58%', left: '8%' },
    ],
    back: [
      { name: 'Latissimus Dorsi', category: 'primary', top: '28%', left: '8%' },
      { name: 'Gluteals & Hamstrings', category: 'primary', top: '52%', right: '8%' },
    ],
  },
};

export const AnatomyBodyMap: React.FC<AnatomyBodyMapProps> = ({
  bodyPart,
  primaryMuscles,
  secondaryMuscles,
  height = 340,
  showToggle = true,
}) => {
  const normalizedBp = useMemo(() => normalizeBodyPart(bodyPart), [bodyPart]);
  const calloutsConfig =
    BODY_PART_CALLOUTS[normalizedBp] ||
    (['Biceps', 'Triceps', 'Forearms'].includes(normalizedBp)
      ? BODY_PART_CALLOUTS['Arms']
      : BODY_PART_CALLOUTS['Full Body']);

  const [prevBp, setPrevBp] = useState(normalizedBp);
  const [activeView, setActiveView] = useState<'3d' | 'front' | 'back'>('3d');

  if (normalizedBp !== prevBp) {
    setPrevBp(normalizedBp);
    setActiveView('3d');
  }

  const activeImage = useMemo(() => {
    if (activeView === '3d') return get3DMuscleAsset(normalizedBp);
    if (activeView === 'back') return ANATOMY_3D_ASSETS.posterior;
    return ANATOMY_3D_ASSETS.anterior;
  }, [activeView, normalizedBp]);

  const currentCallouts = activeView === 'back' ? calloutsConfig.back : calloutsConfig.front;

  return (
    <View style={styles.container}>
      {/* 3D Focus / Anterior / Posterior Segmented Toggle */}
      {showToggle && (
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeView === '3d' && styles.toggleBtnActive,
            ]}
            onPress={() => setActiveView('3d')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="cube"
              size={13}
              color={activeView === '3d' ? '#FFFFFF' : Colors.textDark}
            />
            <Text
              style={[
                styles.toggleBtnText,
                activeView === '3d' && styles.toggleBtnTextActive,
              ]}
            >
              3D Muscle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeView === 'front' && styles.toggleBtnActive,
            ]}
            onPress={() => setActiveView('front')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="body"
              size={13}
              color={activeView === 'front' ? '#FFFFFF' : Colors.textDark}
            />
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
            <Ionicons
              name="body-outline"
              size={13}
              color={activeView === 'back' ? '#FFFFFF' : Colors.textDark}
            />
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

      {/* 3D Photorealistic Anatomical Body Viewport */}
      <View style={[styles.modelViewport, { height }]}>
        <Image
          source={activeImage}
          style={styles.modelImage}
          contentFit="contain"
          cachePolicy="memory-disk"
        />

        {/* 3D Target Badge when in 3D muscle view */}
        {activeView === '3d' && (
          <View style={styles.targetBadgeOverlay}>
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            <Text style={styles.targetBadgeText}>Target: {normalizedBp}</Text>
          </View>
        )}

        {/* Dynamic Targeted Muscle Callout Tags (shown on Anterior/Posterior views) */}
        {activeView !== '3d' &&
          currentCallouts.map((callout, index) => {
          const isPrimary = callout.category === 'primary';
          return (
            <View
              key={`${callout.name}-${index}`}
              style={[
                styles.calloutTag,
                isPrimary ? styles.calloutTagPrimary : styles.calloutTagSecondary,
                { top: callout.top },
                callout.left ? { left: callout.left } : { right: callout.right },
              ]}
            >
              <View
                style={[
                  styles.calloutDot,
                  isPrimary ? styles.calloutDotPrimary : styles.calloutDotSecondary,
                ]}
              />
              <Text
                style={[
                  styles.calloutText,
                  isPrimary ? styles.calloutTextPrimary : styles.calloutTextSecondary,
                ]}
              >
                {callout.name}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Primary Target</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
          <Text style={styles.legendText}>Synergist / Secondary</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
    width: '100%',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: BorderRadius.button,
    padding: 3,
    marginBottom: Spacing.md,
    gap: 4,
    width: '100%',
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.button - 2,
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: Colors.textDark,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  modelViewport: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modelImage: {
    width: '100%',
    height: '100%',
  },
  hudHeaderBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  hudPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  hudBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  calloutTag: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  calloutTagPrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  calloutTagSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: Colors.accent,
    borderWidth: 1,
  },
  calloutDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  calloutDotPrimary: {
    backgroundColor: Colors.primary,
  },
  calloutDotSecondary: {
    backgroundColor: Colors.accent,
  },
  calloutText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
  },
  calloutTextPrimary: {
    color: Colors.primary,
  },
  calloutTextSecondary: {
    color: Colors.accent,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textGrey,
    fontWeight: Typography.weights.medium,
  },
  targetBadgeOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  targetBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
});
