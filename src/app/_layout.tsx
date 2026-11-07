import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthScreen } from '@/components/auth-screen';
import AppTabs from '@/components/app-tabs';
import { HangoutColors } from '@/components/hangout-place-card';
import { AppDataProvider } from '@/hooks/use-app-data';
import { AuthProvider, useAuth } from '@/hooks/use-auth';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <AppDataProvider>
          <AuthenticatedApp />
        </AppDataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { loading, user, role, error, signOut } = useAuth();
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    setSignOutError(null);
    try {
      await signOut();
    } catch (signOutFailure) {
      console.error('Unable to sign out after loading permissions failed.', signOutFailure);
      setSignOutError('Sign out failed. Please try again.');
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={HangoutColors.green} />
        <Text style={styles.message}>Restoring your account…</Text>
      </View>
    );
  }

  if (!user) return <AuthScreen />;

  if (!role) {
    return (
      <View style={styles.centered}>
        {error ? (
          <>
            <Text accessibilityRole="alert" style={styles.error}>
              {signOutError ?? error}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void handleSignOut()}
              style={styles.button}>
              <Text style={styles.buttonText}>Sign out</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator color={HangoutColors.green} />
            <Text style={styles.message}>Loading account permissions…</Text>
          </>
        )}
      </View>
    );
  }

  return <AppTabs />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HangoutColors.background,
    padding: 24,
    gap: 14,
  },
  message: {
    color: HangoutColors.ink,
    fontSize: 14,
  },
  error: {
    color: '#A33B2F',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: HangoutColors.green,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
