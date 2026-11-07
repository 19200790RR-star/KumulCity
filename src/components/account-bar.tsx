import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HangoutColors } from '@/components/hangout-place-card';
import { useAuth } from '@/hooks/use-auth';

export function AccountBar() {
  const { user, role, signOut } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setError(null);
    try {
      await signOut();
    } catch (signOutError) {
      console.error('Unable to sign out.', signOutError);
      setError('Sign out failed. Try again.');
    }
  }

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.identity}>
          <Text style={styles.role}>{role === 'admin' ? 'ADMIN' : 'VISITOR'}</Text>
          <Text numberOfLines={1} style={styles.email}>
            {user?.email}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <Text style={styles.buttonText}>Sign out</Text>
        </Pressable>
      </View>
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  identity: {
    flex: 1,
  },
  role: {
    color: HangoutColors.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  email: {
    color: HangoutColors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: HangoutColors.paleGreen,
  },
  buttonText: {
    color: HangoutColors.green,
    fontSize: 11,
    fontWeight: '800',
  },
  error: {
    color: '#A33B28',
    fontSize: 12,
    marginBottom: 6,
  },
  pressed: {
    opacity: 0.7,
  },
});
