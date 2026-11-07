import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HangoutPlaceCard, HangoutColors } from '@/components/hangout-place-card';
import { AccountBar } from '@/components/account-bar';
import { BrandMark } from '@/components/brand-mark';
import { HANGOUT_CATEGORIES } from '@/constants/hangout-places';
import { useAppData } from '@/hooks/use-app-data';
import { useAuth } from '@/hooks/use-auth';

export default function HomeScreen() {
  const { places, loading, error, refresh } = useAppData();
  const { role } = useAuth();
  const [pickedPlaceId, setPickedPlaceId] = useState<string | null>(null);
  const pickedPlace =
    places.find((place) => place.id === pickedPlaceId) ?? places[0];

  function pickForMe() {
    const options = places.filter((place) => place.id !== pickedPlace?.id);
    if (options.length > 0) {
      setPickedPlaceId(options[Math.floor(Math.random() * options.length)].id);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AccountBar />
        <View style={styles.brandRow}>
          <BrandMark size={54} />
          <View>
            <Text style={styles.brandMeta}>MOROBE, PAPUA NEW GUINEA</Text>
          </View>
          <View style={styles.provinceBadge}>
            <Text style={styles.provinceBadgeText}>MOROBE</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>YOUR PROVINCE, YOUR PLANS</Text>
          <Text style={styles.title}>
            Find your next{'\n'}
            <Text style={styles.titleAccent}>hangout.</Text>
          </Text>
          <Text style={styles.heroText}>
            Discover places to get together, from Lae to the coast and beyond.
          </Text>
        </View>

        <Link href="/explore" asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.searchLink, pressed && styles.pressed]}>
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.searchText}>Search places in Morobe</Text>
            <Text style={styles.searchArrow}>→</Text>
          </Pressable>
        </Link>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Browse your way</Text>
            <Text style={styles.sectionSubtitle}>Choose what you feel like doing.</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          contentContainerStyle={styles.categoryRow}
          showsHorizontalScrollIndicator={false}>
          {HANGOUT_CATEGORIES.map((category, index) => (
            <Link
              href={{ pathname: '/explore', params: { category: category.name } }}
              asChild
              key={category.name}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Browse ${category.name}`}
                style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}>
                <View style={styles.categoryNumber}>
                  <Text style={styles.categoryNumberText}>
                    {String(index + 1).padStart(2, '0')}
                  </Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryArrow}>↗</Text>
              </Pressable>
            </Link>
          ))}
        </ScrollView>

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Need an idea?</Text>
            <Text style={styles.sectionSubtitle}>Let Morobe pick your next stop.</Text>
          </View>
          {role === 'visitor' && places.length > 1 && (
            <Pressable
              accessibilityRole="button"
              onPress={pickForMe}
              style={({ pressed }) => [styles.pickButton, pressed && styles.pressed]}>
              <Text style={styles.pickButtonText}>Pick for me ↗</Text>
            </Pressable>
          )}
        </View>

        {loading && <Text style={styles.noteText}>Loading Morobe places…</Text>}
        {error && (
          <View style={styles.note}>
            <Text style={styles.noteText}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={() => void refresh()}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        )}
        {!loading && !error && !pickedPlace && (
          <View style={styles.note}>
            <Text style={styles.noteTitle}>No places have been added yet</Text>
            <Text style={styles.noteText}>
              An admin can add verified Morobe listings from the Admin tab.
            </Text>
          </View>
        )}
        {pickedPlace && <HangoutPlaceCard place={pickedPlace} />}

        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Explore Morobe</Text>
            <Text style={styles.sectionSubtitle}>A few places to get your plans started.</Text>
          </View>
        </View>

        {places.filter((place) => place.id !== pickedPlace?.id)
          .slice(0, 2)
          .map((place) => (
            <HangoutPlaceCard key={place.id} place={place} />
          ))}

        <View style={styles.note}>
          <Text style={styles.noteTitle}>Local knowledge matters</Text>
          <Text style={styles.noteText}>
            Listings are local suggestions, not a verified directory. Check access and local
            conditions before you head out.
          </Text>
        </View>

        <Link href="/explore" asChild>
          <Pressable style={({ pressed }) => [styles.allPlacesButton, pressed && styles.pressed]}>
            <Text style={styles.allPlacesButtonText}>See all places in Morobe</Text>
            <Text style={styles.allPlacesArrow}>→</Text>
          </Pressable>
        </Link>
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
    paddingTop: 10,
    paddingBottom: 130,
    gap: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  brandMeta: {
    color: HangoutColors.muted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  provinceBadge: {
    marginLeft: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 20,
    backgroundColor: HangoutColors.lime,
  },
  provinceBadgeText: {
    color: HangoutColors.ink,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  hero: {
    paddingVertical: 9,
    gap: 8,
  },
  eyebrow: {
    color: HangoutColors.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: HangoutColors.ink,
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  titleAccent: {
    color: HangoutColors.green,
  },
  heroText: {
    color: HangoutColors.muted,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 340,
  },
  searchLink: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: HangoutColors.surface,
    borderWidth: 1,
    borderColor: HangoutColors.line,
  },
  searchIcon: {
    fontSize: 25,
    color: HangoutColors.green,
    lineHeight: 28,
  },
  searchText: {
    flex: 1,
    color: HangoutColors.muted,
    fontSize: 14,
  },
  searchArrow: {
    color: HangoutColors.green,
    fontSize: 20,
    fontWeight: '700',
  },
  categoryRow: {
    gap: 9,
    paddingRight: 20,
  },
  categoryCard: {
    width: 144,
    minHeight: 105,
    padding: 12,
    borderRadius: 18,
    backgroundColor: HangoutColors.surface,
    borderWidth: 1,
    borderColor: HangoutColors.line,
    justifyContent: 'space-between',
  },
  categoryNumber: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HangoutColors.paleGreen,
  },
  categoryNumberText: {
    color: HangoutColors.green,
    fontSize: 10,
    fontWeight: '900',
  },
  categoryName: {
    color: HangoutColors.ink,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
    marginTop: 9,
  },
  categoryArrow: {
    position: 'absolute',
    right: 12,
    top: 12,
    color: HangoutColors.green,
    fontSize: 15,
    fontWeight: '800',
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 2,
    gap: 8,
  },
  sectionTitle: {
    color: HangoutColors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: HangoutColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  pickButton: {
    backgroundColor: HangoutColors.green,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 13,
  },
  pickButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  note: {
    backgroundColor: '#EEF0E8',
    borderRadius: 17,
    padding: 15,
    gap: 5,
    marginTop: 3,
  },
  noteTitle: {
    color: HangoutColors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  noteText: {
    color: HangoutColors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  allPlacesButton: {
    minHeight: 48,
    borderRadius: 15,
    backgroundColor: HangoutColors.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
  },
  allPlacesButtonText: {
    color: HangoutColors.ink,
    fontSize: 13,
    fontWeight: '800',
  },
  allPlacesArrow: {
    color: HangoutColors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  retryText: {
    color: HangoutColors.green,
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.75,
  },
});
