import { Redirect } from 'expo-router';
import { useProgress } from '@/context/progress';

export default function EntryRoute() {
  const { profile, hydrated } = useProgress();
  if (!hydrated) return null;
  return <Redirect href={profile ? '/(tabs)' : '/onboarding'} />;
}