import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

// Bundled with the app so the artwork works without a network connection.
const artwork = require('../assets/images/stoic-hero.png');

export function StoicHeroArt({ variant = 'portrait' }: { variant?: 'portrait' | 'banner' }) {
  const banner = variant === 'banner';
  return (
    <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.frame}>
      <Image
        source={artwork}
        style={banner ? styles.bannerImage : StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition={banner ? { top: '24%', right: 0 } : { top: '35%', left: '50%' }}
        accessible={false}
        transition={0}
      />
      {banner ? (
        <>
          <LinearGradient colors={['#102334', '#102334E8', '#10233425']} locations={[0, 0.4, 1]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={['#10233400', '#10233455', '#102334']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
        </>
      ) : (
        <LinearGradient colors={['#07131F30', '#07131F00', '#07131F20', '#07131F']} locations={[0, 0.25, 0.68, 1]} style={StyleSheet.absoluteFill} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { ...StyleSheet.absoluteFillObject, overflow: 'hidden', backgroundColor: '#07131F' },
  bannerImage: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '72%' },
});
