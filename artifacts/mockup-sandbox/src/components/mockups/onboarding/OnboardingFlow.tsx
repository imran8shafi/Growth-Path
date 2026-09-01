'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { ChevronRight, Check, Sparkles, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OnboardingData, OnboardingStep } from './types';
import { FitnessGoalStep } from './steps/FitnessGoalStep';
import { ExperienceLevelStep } from './steps/ExperienceLevelStep';
import { WorkoutFrequencyStep } from './steps/WorkoutFrequencyStep';
import { EquipmentAccessStep } from './steps/EquipmentAccessStep';
import { WorkoutDurationStep } from './steps/WorkoutDurationStep';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const STEPS: OnboardingStep[] = [
  { id: 'goal', title: 'Goal', subtitle: 'What\'s your main goal?', component: FitnessGoalStep },
  { id: 'experience', title: 'Experience', subtitle: 'What\'s your experience level?', component: ExperienceLevelStep },
  { id: 'frequency', title: 'Frequency', subtitle: 'How many days can you train?', component: WorkoutFrequencyStep },
  { id: 'equipment', title: 'Equipment', subtitle: 'What equipment do you have?', component: EquipmentAccessStep },
  { id: 'duration', title: 'Duration', subtitle: 'How long per workout?', component: WorkoutDurationStep },
  { id: 'personal', title: 'Profile', subtitle: 'Tell us about yourself', component: PersonalInfoStep },
];

const STEP_FIELDS: (keyof OnboardingData)[] = [
  'fitnessGoal',
  'experienceLevel',
  'workoutFrequency',
  'equipmentAccess',
  'workoutDuration',
  'age',
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    fitnessGoal: null,
    experienceLevel: null,
    workoutFrequency: null,
    equipmentAccess: null,
    workoutDuration: null,
    age: null,
    gender: null,
    height: null,
    weight: null,
  });
  const [completed, setCompleted] = useState(false);
  const [direction, setDirection] = useState(1);

  const currentStepData = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const canProceed = STEP_FIELDS[currentStep] ? !!data[STEP_FIELDS[currentStep] as keyof OnboardingData] : true;

  const handleNext = useCallback((newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
    
    if (isLast) {
      setCompleted(true);
    } else {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [isLast]);

  const handleBack = useCallback(() => {
    if (!isFirst) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  }, [isFirst]);

  const handleSkip = useCallback(() => {
    if (isLast) {
      setCompleted(true);
    } else {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  }, [isLast]);

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="flex flex-col items-center justify-center min-h-screen bg-background px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-8 flex items-center justify-center w-24 h-24 rounded-full bg-primary/10"
        >
          <Sparkles className="w-12 h-12 text-primary" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-center text-4xl font-bold tracking-tight mb-4"
        >
          You&apos;re all set!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-center text-muted-foreground text-lg max-w-md mb-8"
        >
          Your personalized fitness adventure is ready. Let&apos;s start leveling up!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="space-y-3 w-full max-w-md"
        >
          <Button size="lg" className="w-full">
            <Dumbbell className="w-5 h-5 mr-2" />
            Start My Adventure
          </Button>
          <Button size="lg" variant="outline" className="w-full">
            View My Plan
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="mt-12 p-6 rounded-2xl bg-card border text-center max-w-md"
        >
          <h3 className="font-semibold mb-3">Your Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {data.fitnessGoal && (
              <div className="text-left">
                <p className="text-muted-foreground">Goal</p>
                <p className="font-medium capitalize">{data.fitnessGoal.replace('_', ' ')}</p>
              </div>
            )}
            {data.experienceLevel && (
              <div className="text-left">
                <p className="text-muted-foreground">Level</p>
                <p className="font-medium capitalize">{data.experienceLevel}</p>
              </div>
            )}
            {data.workoutFrequency && (
              <div className="text-left">
                <p className="text-muted-foreground">Frequency</p>
                <p className="font-medium">{data.workoutFrequency.replace('_', ' ')}</p>
              </div>
            )}
            {data.equipmentAccess && (
              <div className="text-left">
                <p className="text-muted-foreground">Equipment</p>
                <p className="font-medium capitalize">{data.equipmentAccess.replace('_', ' ')}</p>
              </div>
            )}
            {data.workoutDuration && (
              <div className="text-left">
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{data.workoutDuration.replace('_', ' ')}</p>
              </div>
            )}
            {data.age && (
              <div className="text-left">
                <p className="text-muted-foreground">Age</p>
                <p className="font-medium">{data.age}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const CurrentStepComponent = currentStepData.component;

  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-background/80 backdrop-blur-sm border-b border-border/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep + 1} of {STEPS.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </motion.div>

      {/* Step Indicator Dots */}
      <motion.div
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        {STEPS.map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.05 * index, duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              index < currentStep
                ? 'bg-primary'
                : index === currentStep
                ? 'bg-primary'
                : 'bg-border'
            )}
          />
        ))}
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: direction > 0 ? 300 : -300, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: direction > 0 ? -300 : 300, scale: 0.95 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.4, 0, 0.2, 1],
            // Stagger children animations
          }}
          className="flex-1 flex flex-col pt-28 pb-20"
        >
          <CurrentStepComponent
            data={data}
            onNext={handleNext}
            onBack={handleBack}
            isFirst={isFirst}
            isLast={isLast}
          />
          
          {/* Next Button - shown at bottom for steps that have selection */}
          {!isLast && STEP_FIELDS[currentStep] && canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
              className="px-4 pb-8"
            >
              <Button
                onClick={() => handleNext({})}
                size="lg"
                className="w-full"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Background decorative elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
            rotate: [0, 2, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-10 w-64 h-64 rounded-full bg-primary/5 blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -15, 0],
            y: [0, 15, 0],
            rotate: [0, -2, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
          className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-primary/5 blur-3xl"
        />
      </div>
    </div>
  );
}