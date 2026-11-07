import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { BrandMark } from '@/components/brand-mark';

const DURATION = 600;

const fadeOutKeyframe = new Keyframe({
  0: { opacity: 1 },
  55: { opacity: 1 },
  100: { opacity: 0, easing: Easing.out(Easing.cubic) },
});

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const content = (
    <View style={styles.brandLockup}>
      <BrandMark size={180} />
    </View>
  );

  return (
    <View
      onLayout={() => {
        void SplashScreen.hideAsync();
      }}
      style={styles.container}>
      <Animated.View
        entering={fadeOutKeyframe.duration(DURATION).withCallback((finished) => {
          'worklet';
          if (finished) scheduleOnRN(setVisible, false);
        })}
        style={styles.content}>
        {content}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F3F7F2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
  },
  brandLockup: {
    alignItems: 'center',
    gap: 12,
  },
});
