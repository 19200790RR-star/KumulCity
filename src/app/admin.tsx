import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountBar } from '@/components/account-bar';
import { HangoutColors } from '@/components/hangout-place-card';
import type { HangoutPlace } from '@/constants/hangout-places';
import { useAppData, type PlaceInput, type PlaceRecord } from '@/hooks/use-app-data';
import { useAuth } from '@/hooks/use-auth';

const INITIAL_FORM: PlaceInput = {
  name: '',
  area: '',
  categoryGroup: 'Outdoor & Nature',
  category: 'Parks',
  placeType: 'Nature',
  hangoutStyles: [],
  description: '',
};

function placeToInput(place: PlaceRecord): PlaceInput {
  return {
    name: place.name,
    area: place.area,
    categoryGroup: place.categoryGroup,
    category: place.category,
    placeType: place.placeType,
    hangoutStyles: place.hangoutStyles,
    description: place.description,
    imageKey: place.imageKey,
  };
}

export default function AdminScreen() {
  const { role } = useAuth();
  const { places, loading, error, refresh, savePlace, deletePlace } = useAppData();
  const [form, setForm] = useState<PlaceInput>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function updateField<K extends keyof PlaceInput>(key: K, value: PlaceInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function editPlace(place: PlaceRecord) {
    setEditingId(place.id);
    setForm(placeToInput(place));
    setFormError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setFormError(null);
  }

  async function submitPlace() {
    if (!form.name.trim() || !form.area.trim() || !form.description.trim()) {
      setFormError('Enter a place name, area, and description.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await savePlace(form, editingId ?? undefined);
      resetForm();
    } catch (saveError) {
      console.error('Unable to save place.', saveError);
      setFormError(saveError instanceof Error ? saveError.message : 'Unable to save this place.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(place: HangoutPlace) {
    Alert.alert('Delete this place?', `Remove ${place.name} from KumulCity?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deletePlace(place.id).catch((deleteError: unknown) => {
            console.error('Unable to delete place.', deleteError);
            setFormError(
              deleteError instanceof Error ? deleteError.message : 'Unable to delete this place.',
            );
          });
        },
      },
    ]);
  }

  if (role !== 'admin') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.error}>Admin permissions are required for venue management.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AccountBar />
        <Text style={styles.eyebrow}>ADMIN TOOLS</Text>
        <Text style={styles.title}>Manage places</Text>
        <Text style={styles.subtitle}>
          Local admin profiles can add, edit, or remove listings on this device.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{editingId ? 'Edit place' : 'Add a place'}</Text>
          <TextInput
            accessibilityLabel="Place name"
            onChangeText={(value) => updateField('name', value)}
            placeholder="Place name"
            style={styles.input}
            value={form.name}
          />
          <TextInput
            accessibilityLabel="Area in Morobe"
            onChangeText={(value) => updateField('area', value)}
            placeholder="Area in Morobe"
            style={styles.input}
            value={form.area}
          />
          <TextInput
            accessibilityLabel="Category group"
            onChangeText={(value) => updateField('categoryGroup', value)}
            placeholder="Category group (e.g. Food & Dining)"
            style={styles.input}
            value={form.categoryGroup}
          />
          <TextInput
            accessibilityLabel="Place category"
            onChangeText={(value) => updateField('category', value)}
            placeholder="Specific category (e.g. Cafes)"
            style={styles.input}
            value={form.category ?? ''}
          />
          <TextInput
            accessibilityLabel="Place type: Nature, Coast, or Town"
            onChangeText={(value) =>
              updateField(
                'placeType',
                value === 'Nature' || value === 'Coast' ? value : 'Town',
              )
            }
            placeholder="Place type: Nature, Coast, or Town"
            style={styles.input}
            value={form.placeType}
          />
          <TextInput
            accessibilityLabel="Description"
            multiline
            onChangeText={(value) => updateField('description', value)}
            placeholder="Short description"
            style={[styles.input, styles.descriptionInput]}
            value={form.description}
          />
          {formError && (
            <Text accessibilityRole="alert" style={styles.error}>
              {formError}
            </Text>
          )}
          <View style={styles.formActions}>
            {editingId && (
              <Pressable onPress={resetForm} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              disabled={saving}
              onPress={submitPlace}
              style={({ pressed }) => [
                styles.saveButton,
                saving && styles.disabled,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.saveText}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add place'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.listHeading}>
          <Text style={styles.formTitle}>Current listings</Text>
          <Pressable onPress={() => void refresh()}>
            <Text style={styles.refreshText}>Refresh</Text>
          </Pressable>
        </View>
        {error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        {loading && <Text style={styles.subtitle}>Loading places…</Text>}
        {!loading && places.length === 0 && !error && (
          <Text style={styles.subtitle}>No places yet. Add the first verified listing above.</Text>
        )}
        {places.map((place) => (
          <View key={place.id} style={styles.placeRow}>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeMeta}>
                {place.area} · {place.category ?? place.placeType}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${place.name}`}
              onPress={() => editPlace(place)}
              style={styles.smallButton}>
              <Text style={styles.smallButtonText}>Edit</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Delete ${place.name}`}
              onPress={() => confirmDelete(place)}
              style={[styles.smallButton, styles.deleteButton]}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HangoutColors.background,
  },
  content: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 140,
    gap: 12,
  },
  eyebrow: {
    color: HangoutColors.green,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    color: HangoutColors.ink,
    fontSize: 29,
    fontWeight: '900',
  },
  subtitle: {
    color: HangoutColors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  formCard: {
    backgroundColor: HangoutColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: HangoutColors.line,
    padding: 15,
    gap: 10,
    marginTop: 4,
  },
  formTitle: {
    color: HangoutColors.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  input: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HangoutColors.line,
    color: HangoutColors.ink,
    backgroundColor: HangoutColors.background,
    fontSize: 13,
  },
  descriptionInput: {
    minHeight: 76,
    paddingTop: 11,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  saveButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: HangoutColors.green,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cancelButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cancelText: {
    color: HangoutColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  listHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  refreshText: {
    color: HangoutColors.green,
    fontSize: 12,
    fontWeight: '800',
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: HangoutColors.surface,
    borderRadius: 15,
    padding: 11,
    borderColor: HangoutColors.line,
    borderWidth: 1,
  },
  placeInfo: {
    flex: 1,
    gap: 3,
  },
  placeName: {
    color: HangoutColors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  placeMeta: {
    color: HangoutColors.muted,
    fontSize: 10,
  },
  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: HangoutColors.paleGreen,
    borderRadius: 10,
  },
  smallButtonText: {
    color: HangoutColors.green,
    fontSize: 10,
    fontWeight: '800',
  },
  deleteButton: {
    backgroundColor: '#FFF0EB',
  },
  deleteText: {
    color: '#A33B28',
    fontSize: 10,
    fontWeight: '800',
  },
  error: {
    color: '#A33B28',
    fontSize: 12,
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.72,
  },
});
