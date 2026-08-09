import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';

export function useColors() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const palette = scheme === 'dark' ? colors.dark : colors.light;
  return { ...palette, scheme };
}