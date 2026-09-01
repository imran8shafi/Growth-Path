'use client';

import { motion } from 'framer-motion';
import { Dumbbell, Flame, Zap, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FitnessGoal, FITNESS_GOALS, OnboardingStepProps } from '../types';

const ICON_MAP = {
  dumbbell: Dumbbell,
  flame: Flame,
  zap: Zap,
  calendar: Calendar,
};

export function FitnessGoalStep({ data, onNext, onBack, isFirst }: OnboardingStepProps) {
  const selectedGoal = data.fitnessGoal;

  const handleSelect = (goal: FitnessGoal) => {
    onNext({ ...data, fitnessGoal: goal });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-10 flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/10"
        >
          <Dumbbell className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-center text-3xl font-bold tracking-tight"
        >
          What&apos;s your main goal?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-3 text-center text-muted-foreground text-lg max-w-xs"
        >
          This helps us create your personalized adventure
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="flex-1 px-4 py-6"
      >
        <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
          {FITNESS_GOALS.map((goal, index) => (
            <motion.button
              key={goal.value}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: 0.05 * index, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(goal.value)}
              className={cn(
                'relative h-32 rounded-2xl border-2 transition-all duration-200',
                'flex flex-col items-center justify-center gap-3 p-4',
                selectedGoal === goal.value
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border bg-background hover:border-primary/50 hover:bg-accent'
              )}
            >
              <motion.div
                animate={{ scale: selectedGoal === goal.value ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary"
              >
                <ICON_MAP[goal.icon as keyof typeof ICON_MAP] className="w-6 h-6" />
              </motion.div>
              <span className="font-semibold text-base">{goal.label}</span>
              <span className="text-xs text-muted-foreground">{goal.description}</span>
              {selectedGoal === goal.value && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="px-4 pb-8"
      >
        <button
          onClick={onBack}
          disabled={isFirst}
          className="w-full py-3 px-6 rounded-xl font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Skip for now
        </button>
      </motion.div>
    </motion.div>
  );
}