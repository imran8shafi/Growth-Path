import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useDesignSystemFonts } from '@/hooks/use-fonts';
import { ProgressProvider, useProgress } from '@/context/progress';
import { RecordingCleanup } from '@/components/recording-cleanup';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { hydrated, profile } = useProgress();

  if (!hydrated) return null;

  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Protected guard={Boolean(profile)}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="session" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="practice" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="programme-settings" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="exercise-videos" options={{ headerShown: false, animation: 'slide_from_right' }} />
      </Stack.Protected>
      <Stack.Protected guard={!profile}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const { fontsLoaded, fontError } = useDesignSystemFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <ProgressProvider>
                <RecordingCleanup />
                <RootLayoutNav />
              </ProgressProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
