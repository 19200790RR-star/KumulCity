import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { HangoutColors } from '@/components/hangout-place-card';
import { useAuth } from '@/hooks/use-auth';

export function AuthScreen() {
  const { loading, error: authError, signIn, signUp } = useAuth();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'visitor'>('visitor');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setFormError(null);
    if (!email.trim() || !email.includes('@')) {
      setFormError('Enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      if (isCreatingAccount) {
        await signUp(email.trim(), selectedRole);
      } else {
        await signIn(email.trim());
      }
    } catch (submitError) {
      console.error('Authentication request failed.', submitError);
      setFormError(
        submitError instanceof Error ? submitError.message : 'Sign-in failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <BrandMark size={64} />
          <Text style={styles.eyebrow}>MOROBE, PAPUA NEW GUINEA</Text>
          <Text style={styles.title}>Welcome to KumulCity</Text>
          <Text style={styles.subtitle}>
            {isCreatingAccount
              ? 'Create a local profile to explore Morobe places.'
              : 'Sign in to your local profile on this device.'}
          </Text>
          <View style={styles.purposeCard}>
            <Text style={styles.purposeTitle}>Find the right place for your gathering</Text>
            <Text style={styles.purposeText}>
              Discover Morobe spots for a casual hangout, community event, or formal meeting.
              Visitor ratings share local impressions and help others compare places before they
              choose.
            </Text>
          </View>
          <TextInput
            accessibilityLabel="Local profile email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email for local profile"
            placeholderTextColor={HangoutColors.muted}
            style={styles.input}
            value={email}
          />
          {isCreatingAccount && (
            <View style={styles.roleChoices}>
              {(['visitor', 'admin'] as const).map((role) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedRole === role }}
                  key={role}
                  onPress={() => setSelectedRole(role)}
                  style={[styles.roleChoice, selectedRole === role && styles.selectedRoleChoice]}>
                  <Text
                    style={[
                      styles.roleChoiceText,
                      selectedRole === role && styles.selectedRoleChoiceText,
                    ]}>
                    {role === 'admin' ? 'Local admin' : 'Visitor'}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          {(formError || authError) && (
            <Text accessibilityRole="alert" style={styles.error}>
              {formError ?? authError}
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={submitting || loading}
            onPress={submit}
            style={({ pressed }) => [
              styles.submit,
              (submitting || loading) && styles.disabled,
              pressed && styles.pressed,
            ]}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>
                {isCreatingAccount ? `Create ${selectedRole} profile` : 'Continue with email'}
              </Text>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setIsCreatingAccount((current) => !current);
              setFormError(null);
            }}
            style={styles.modeToggle}>
            <Text style={styles.modeToggleText}>
              {isCreatingAccount
                ? 'Already have a profile? Sign in'
                : 'New here? Create a local profile'}
            </Text>
          </Pressable>
          <Text style={styles.roleNote}>
            Local demo only: profiles have no password, and places, ratings, and visits stay on this
            device. Anyone with access to the device can create an admin profile or switch profiles.
            This is not secure authentication.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HangoutColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    padding: 22,
    gap: 13,
    borderRadius: 24,
    backgroundColor: HangoutColors.surface,
    borderColor: HangoutColors.line,
    borderWidth: 1,
  },
  eyebrow: {
    color: HangoutColors.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  title: {
    color: HangoutColors.ink,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
  },
  subtitle: {
    color: HangoutColors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  purposeCard: {
    padding: 14,
    gap: 6,
    borderRadius: 16,
    backgroundColor: HangoutColors.paleGreen,
  },
  purposeTitle: {
    color: HangoutColors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  purposeText: {
    color: HangoutColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: HangoutColors.line,
    color: HangoutColors.ink,
    backgroundColor: HangoutColors.background,
    fontSize: 14,
  },
  submit: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HangoutColors.green,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modeToggle: {
    alignItems: 'center',
    paddingVertical: 7,
  },
  modeToggleText: {
    color: HangoutColors.green,
    fontSize: 13,
    fontWeight: '700',
  },
  error: {
    color: '#A33B28',
    fontSize: 12,
    lineHeight: 18,
  },
  roleNote: {
    color: HangoutColors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  roleChoices: {
    flexDirection: 'row',
    gap: 10,
  },
  roleChoice: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HangoutColors.line,
  },
  selectedRoleChoice: {
    backgroundColor: HangoutColors.paleGreen,
    borderColor: HangoutColors.green,
  },
  roleChoiceText: {
    color: HangoutColors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  selectedRoleChoiceText: {
    color: HangoutColors.green,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.75,
  },
});
