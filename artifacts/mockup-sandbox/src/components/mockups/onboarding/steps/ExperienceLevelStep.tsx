'use client';

import { motion } from 'framer-motion';
import { Dumbbell, Award, Trophy } from 'lucide-react';
import { ExperienceLevel, EXPERIENCE_LEVELS, OnboardingStepProps } from '../types';

const ICON_MAP = {
  beginner: Dumbbell,
  intermediate: Award,
  advanced: Trophy,
};

const ICON_BG = {
  beginner: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  advanced: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
};

export function ExperienceLevelStep({ data, onNext, onBack, isFirst }: OnboardingStepProps) {
  const selectedLevel = data.experienceLevel;

  const handleSelect = (level: ExperienceLevel) => {
    onNext({ ...data, experienceLevel: level });
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
          <Award className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-center text-3xl font-bold tracking-tight"
        >
          What&apos;s your experience level?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-3 text-center text-muted-foreground text-lg max-w-xs"
        >
          We&apos;ll tailor workouts to match your level
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="flex-1 px-4 py-6"
      >
        <div className="space-y-4 max-w-md mx-auto">
          {EXPERIENCE_LEVELS.map((level, index) => (
            <motion.button
              key={level.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.08 * index, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(level.value)}
              className={cn(
                'relative w-full h-20 rounded-2xl border-2 transition-all duration-200',
                'flex items-center gap-4 p-4 text-left',
                selectedLevel === level.value
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border bg-background hover:border-primary/50 hover:bg-accent'
              )}
            >
              <motion.div
                animate={{ scale: selectedLevel === level.value ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl',
                  ICON_BG[level.value]
                )}
              >
                <ICON_MAP[level.value] className="w-6 h-6" />
              </motion.div>
              <div className="flex-1">
                <span className="font-semibold text-base">{level.label}</span>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </div>
              {selectedLevel === level.value && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
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
          Back
        </button>
      </motion.div>
    </motion.div>
  );
}

import { cn } from '@/lib/utils';