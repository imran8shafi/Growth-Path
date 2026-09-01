export type FitnessGoal = 
  | 'build_muscle' 
  | 'lose_weight' 
  | 'improve_strength' 
  | 'stay_consistent';

export type ExperienceLevel = 
  | 'beginner' 
  | 'intermediate' 
  | 'advanced';

export type WorkoutFrequency = 
  | '2_days' 
  | '3_days' 
  | '4_days' 
  | '5_days' 
  | '6_days';

export type EquipmentAccess = 
  | 'full_gym' 
  | 'home_gym' 
  | 'bodyweight' 
  | 'minimal';

export type WorkoutDuration = 
  | '15_min' 
  | '30_min' 
  | '45_min' 
  | '60_min';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface OnboardingData {
  fitnessGoal: FitnessGoal | null;
  experienceLevel: ExperienceLevel | null;
  workoutFrequency: WorkoutFrequency | null;
  equipmentAccess: EquipmentAccess | null;
  workoutDuration: WorkoutDuration | null;
  age: number | null;
  gender: Gender | null;
  height: number | null; // in cm
  weight: number | null; // in kg
}

export interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  component: React.ComponentType<OnboardingStepProps>;
}

export interface OnboardingStepProps {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const FITNESS_GOALS: { value: FitnessGoal; label: string; description: string; icon: string }[] = [
  { value: 'build_muscle', label: 'Build Muscle', description: 'Gain size and strength', icon: 'dumbbell' },
  { value: 'lose_weight', label: 'Lose Weight', description: 'Burn fat and get lean', icon: 'flame' },
  { value: 'improve_strength', label: 'Improve Strength', description: 'Get stronger, lift heavier', icon: 'zap' },
  { value: 'stay_consistent', label: 'Stay Consistent', description: 'Build a sustainable habit', icon: 'calendar' },
];

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to working out' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced lifter' },
];

export const WORKOUT_FREQUENCIES: { value: WorkoutFrequency; label: string; days: number }[] = [
  { value: '2_days', label: '2 Days/Week', days: 2 },
  { value: '3_days', label: '3 Days/Week', days: 3 },
  { value: '4_days', label: '4 Days/Week', days: 4 },
  { value: '5_days', label: '5 Days/Week', days: 5 },
  { value: '6_days', label: '6 Days/Week', days: 6 },
];

export const EQUIPMENT_OPTIONS: { value: EquipmentAccess; label: string; description: string; icon: string }[] = [
  { value: 'full_gym', label: 'Full Gym Access', description: 'Machines, free weights, cardio', icon: 'building' },
  { value: 'home_gym', label: 'Home Gym', description: 'Dumbbells, bench, bands', icon: 'home' },
  { value: 'minimal', label: 'Minimal Equipment', description: 'Dumbbells or kettlebells', icon: 'dumbbell' },
  { value: 'bodyweight', label: 'Bodyweight Only', description: 'No equipment needed', icon: 'user' },
];

export const DURATION_OPTIONS: { value: WorkoutDuration; label: string; minutes: number }[] = [
  { value: '15_min', label: '15 Minutes', minutes: 15 },
  { value: '30_min', label: '30 Minutes', minutes: 30 },
  { value: '45_min', label: '45 Minutes', minutes: 45 },
  { value: '60_min', label: '60 Minutes', minutes: 60 },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];