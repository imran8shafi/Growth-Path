'use client';

import { motion } from 'framer-motion';
import { Calendar, Check } from 'lucide-react';
import { WorkoutFrequency, WORKOUT_FREQUENCIES, OnboardingStepProps } from '../types';
import { cn } from '@/lib/utils';

export function WorkoutFrequencyStep({ data, onNext, onBack }: OnboardingStepProps) {
  const selectedFrequency = data.workoutFrequency;

  const handleSelect = (frequency: WorkoutFrequency) => {
    onNext({ ...data, workoutFrequency: frequency });
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
          <Calendar className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-center text-3xl font-bold tracking-tight"
        >
          How many days can you train?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-3 text-center text-muted-foreground text-lg max-w-xs"
        >
          Be realistic — consistency beats intensity
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="flex-1 px-4 py-6"
      >
        <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
          {WORKOUT_FREQUENCIES.map((freq, index) => (
            <motion.button
              key={freq.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.05 * index, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(freq.value)}
              className={cn(
                'relative w-full max-w-xs h-20 rounded-2xl border-2 transition-all duration-200',
                'flex items-center justify-center gap-4 px-6',
                selectedFrequency === freq.value
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-border bg-background hover:border-primary/50 hover:bg-accent'
              )}
            >
              <motion.div
                animate={{ 
                  scale: selectedFrequency === freq.value ? 1.1 : 1,
                  backgroundColor: selectedFrequency === freq.value ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  color: selectedFrequency === freq.value ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'
                }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl font-bold text-xl"
              >
                {freq.days}
              </motion.div>
              <div className="text-left">
                <span className="font-semibold text-base">{freq.label}</span>
                <p className="text-sm text-muted-foreground">{freq.days} workouts per week</p>
              </div>
              {selectedFrequency === freq.value && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
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
          className="w-full py-3 px-6 rounded-xl font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Back
        </button>
      </motion.div>
    </motion.div>
  );
}