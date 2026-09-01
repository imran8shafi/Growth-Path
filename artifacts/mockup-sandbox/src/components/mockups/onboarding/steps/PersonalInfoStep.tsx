'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { User, Scale, Ruler, Male, Female } from 'lucide-react';
import { Gender, GENDER_OPTIONS, OnboardingStepProps, OnboardingData } from '../types';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export function PersonalInfoStep({ data, onNext, onBack, isLast }: OnboardingStepProps) {
  const [age, setAge] = useState(data.age || 25);
  const [gender, setGender] = useState<Gender | null>(data.gender || null);
  const [height, setHeight] = useState(data.height || 175);
  const [weight, setWeight] = useState(data.weight || 70);
  const [activeField, setActiveField] = useState<'age' | 'gender' | 'height' | 'weight'>('age');

  const ageSpring = useSpring(useMotionValue(age), { stiffness: 200, damping: 20 });
  const heightSpring = useSpring(useMotionValue(height), { stiffness: 200, damping: 20 });
  const weightSpring = useSpring(useMotionValue(weight), { stiffness: 200, damping: 20 });

  useEffect(() => {
    const newData: Partial<OnboardingData> = { age, gender, height, weight };
    onNext(newData);
  }, [age, gender, height, weight, onNext]);

  const fields = [
    { key: 'age', label: 'Age', value: age, min: 13, max: 100, unit: 'years', icon: User },
    { key: 'height', label: 'Height', value: height, min: 100, max: 250, unit: 'cm', icon: Ruler },
    { key: 'weight', label: 'Weight', value: weight, min: 30, max: 200, unit: 'kg', icon: Scale },
  ];

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
          <User className="w-12 h-12 text-primary" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-center text-3xl font-bold tracking-tight"
        >
          Tell us about yourself
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-3 text-center text-muted-foreground text-lg max-w-xs"
        >
          This helps us calculate your stats (optional)
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="flex-1 px-4 py-6 overflow-y-auto"
      >
        <div className="space-y-8 max-w-xl mx-auto">
          {/* Gender Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="space-y-4"
          >
            <Label className="text-sm font-medium">Gender</Label>
            <div className="grid grid-cols-4 gap-3">
              {GENDER_OPTIONS.map((g, index) => (
                <motion.button
                  key={g.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index, duration: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setGender(g.value)}
                  className={cn(
                    'relative py-3 px-4 rounded-xl border-2 transition-all duration-200',
                    'flex flex-col items-center gap-1',
                    gender === g.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-background hover:border-primary/50'
                  )}
                >
                  {g.value === 'male' && <Male className="w-5 h-5" />}
                  {g.value === 'female' && <Female className="w-5 h-5" />}
                  {g.value === 'other' && <User className="w-5 h-5" />}
                  {g.value === 'prefer_not_to_say' && <User className="w-5 h-5 opacity-50" />}
                  <span className="text-sm font-medium">{g.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Sliders */}
          {fields.map((field, fieldIndex) => (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + fieldIndex * 0.08, duration: 0.3 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <field.icon className="w-4 h-4 text-muted-foreground" />
                  {field.label}
                </Label>
                <motion.span
                  animate={{ 
                    scale: activeField === field.key ? 1.1 : 1,
                    color: activeField === field.key ? 'hsl(var(--primary))' : 'hsl(var(--foreground))'
                  }}
                  className="text-xl font-bold tabular-nums"
                >
                  {field.key === 'age' ? ageSpring : field.key === 'height' ? heightSpring : weightSpring}
                </motion.span>
              </div>
              <Slider
                value={field.key === 'age' ? age : field.key === 'height' ? height : weight}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  if (field.key === 'age') setAge(val);
                  if (field.key === 'height') setHeight(val);
                  if (field.key === 'weight') setWeight(val);
                }}
                max={field.max}
                min={field.min}
                step={1}
                onMouseDown={() => setActiveField(field.key as typeof activeField)}
                onTouchStart={() => setActiveField(field.key as typeof activeField)}
                onMouseUp={() => setActiveField('age')}
                onTouchEnd={() => setActiveField('age')}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{field.min}{field.unit}</span>
                <span>{field.max}{field.unit}</span>
              </div>
            </motion.div>
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
          {isLast ? 'Get My Plan' : 'Back'}
        </button>
      </motion.div>
    </motion.div>
  );
}