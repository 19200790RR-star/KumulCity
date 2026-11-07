import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

type BrandMarkProps = {
  size?: number;
};

export function BrandMark({ size = 48 }: BrandMarkProps) {
  return (
    <Image
      accessibilityLabel="KumulCity logo"
      contentFit="contain"
      source={require('@/assets/images/kumulcity-logo.png')}
      style={[styles.logo, { width: size, height: size * 1.1 }]}
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    flexShrink: 0,
  },
});
