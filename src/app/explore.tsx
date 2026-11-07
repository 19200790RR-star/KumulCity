import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountBar } from '@/components/account-bar';
import { HangoutPlaceCard, HangoutColors } from '@/components/hangout-place-card';
import {
  HANGOUT_CATEGORIES,
  type HangoutCategory,
  type HangoutCategoryGroup,
} from '@/constants/hangout-places';
import { useAppData } from '@/hooks/use-app-data';

function getCategoryGroup(value: string | string[] | undefined): HangoutCategoryGroup | null {
  if (typeof value !== 'string') {
    return null;
  }

  return HANGOUT_CATEGORIES.find((categoryGroup) => categoryGroup.name === value)?.name ?? null;
}

export default function ExploreScreen() {
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const { places, loading, error, refresh } = useAppData();
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('All Morobe');
  const [selectedGroup, setSelectedGroup] = useState<HangoutCategoryGroup | null>(() =>
    getCategoryGroup(categoryParam),
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<HangoutCategory | null>(null);

  useEffect(() => {
    setSelectedGroup(getCategoryGroup(categoryParam));
    setSelectedSubcategory(null);
  }, [categoryParam]);

  const selectedCategoryGroup = HANGOUT_CATEGORIES.find(
    (categoryGroup) => categoryGroup.name === selectedGroup,
  );
  const areas = useMemo(
    () => ['All Morobe', ...Array.from(new Set(places.map((place) => place.area))).sort()],
    [places],
  );

  const filteredPlaces = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return places.filter((place) => {
      const matchesArea = selectedArea === 'All Morobe' || place.area === selectedArea;
      const matchesGroup =
        selectedGroup === null ||
        (selectedGroup === 'Hangout Style'
          ? Boolean(place.hangoutStyles?.length)
          : place.categoryGroup === selectedGroup);
      const matchesSubcategory =
        selectedSubcategory === null ||
        (selectedGroup === 'Hangout Style'
          ? Boolean(place.hangoutStyles?.some((style) => style === selectedSubcategory))
          : place.category === selectedSubcategory);
      const matchesSearch =
        searchTerm.length === 0 ||
        `${place.name} ${place.area} ${place.placeType} ${place.category ?? ''} ${
          place.hangoutStyles?.join(' ') ?? ''
        }`
          .toLowerCase()
          .includes(searchTerm);

      return matchesArea && matchesGroup && matchesSubcategory && matchesSearch;
    });
  }, [places, search, selectedArea, selectedGroup, selectedSubcategory, selectedCategoryGroup]);

  function clearFilters() {
    setSearch('');
    setSelectedArea('All Morobe');
    setSelectedGroup(null);
    setSelectedSubcategory(null);
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <AccountBar />
        <View style={styles.header}>
          <Text style={styles.eyebrow}>MADE FOR MOROBE</Text>
          <Text style={styles.title}>Explore places</Text>
          <Text style={styles.subtitle}>
            Find a spot that suits your group and your kind of day.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Search hangout places"
            autoCapitalize="none"
            onChangeText={setSearch}
            placeholder="Search a place or town"
            placeholderTextColor={HangoutColors.muted}
            returnKeyType="search"
            style={styles.searchInput}
            value={search}
          />
          {search.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearch('')}
              hitSlop={8}>
              <Text style={styles.clearSearch}>×</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.filterLabel}>AREA</Text>
        <ScrollView
          horizontal
          contentContainerStyle={styles.chipRow}
          showsHorizontalScrollIndicator={false}>
          {areas.map((area) => {
            const isSelected = selectedArea === area;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={area}
                onPress={() => setSelectedArea(area)}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected && styles.selectedChip,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>{area}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.filterLabel}>CATEGORY</Text>
        <ScrollView
          horizontal
          contentContainerStyle={styles.chipRow}
          showsHorizontalScrollIndicator={false}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: selectedGroup === null }}
            onPress={() => {
              setSelectedGroup(null);
              setSelectedSubcategory(null);
            }}
            style={({ pressed }) => [
              styles.chip,
              selectedGroup === null && styles.selectedChip,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.chipText, selectedGroup === null && styles.selectedChipText]}>
              All categories
            </Text>
          </Pressable>
          {HANGOUT_CATEGORIES.map(({ name }) => {
            const isSelected = selectedGroup === name;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                key={name}
                onPress={() => {
                  setSelectedGroup(name);
                  setSelectedSubcategory(null);
                }}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected && styles.selectedChip,
                  pressed && styles.pressed,
                ]}>
                <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>{name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {selectedCategoryGroup && (
          <>
            <Text style={styles.filterLabel}>SPECIFIC PLACE OR STYLE</Text>
            <ScrollView
              horizontal
              contentContainerStyle={styles.chipRow}
              showsHorizontalScrollIndicator={false}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedSubcategory === null }}
                onPress={() => setSelectedSubcategory(null)}
                style={({ pressed }) => [
                  styles.chip,
                  selectedSubcategory === null && styles.selectedChip,
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    selectedSubcategory === null && styles.selectedChipText,
                  ]}>
                  Any
                </Text>
              </Pressable>
              {selectedCategoryGroup.options.map((subcategory) => {
                const isSelected = selectedSubcategory === subcategory;
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    key={subcategory}
                    onPress={() => setSelectedSubcategory(subcategory)}
                    style={({ pressed }) => [
                      styles.chip,
                      isSelected && styles.selectedChip,
                      pressed && styles.pressed,
                    ]}>
                    <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
                      {subcategory}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}

        <View style={styles.resultsHeading}>
          <Text style={styles.resultsTitle}>Places to consider</Text>
          <Text style={styles.resultCount}>{filteredPlaces.length}</Text>
        </View>

        {loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading Morobe places…</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={() => void refresh()}>
              <Text style={styles.resetButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : filteredPlaces.length > 0 ? (
          filteredPlaces.map((place) => <HangoutPlaceCard key={place.id} place={place} />)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {selectedGroup || selectedSubcategory
                ? 'More local listings are on the way'
                : 'No places match yet'}
            </Text>
            <Text style={styles.emptyText}>
              {selectedGroup || selectedSubcategory
                ? `We haven't added ${selectedSubcategory ?? selectedGroup} places yet. Try another category or explore all current suggestions.`
                : 'Try another area, category, or search.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={clearFilters}
              style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}>
              <Text style={styles.resetButtonText}>Clear filters</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.disclaimer}>
          Listings are local suggestions, not a verified directory. Check access, travel conditions
          and opening details before making plans.
        </Text>
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
    paddingTop: 16,
    paddingBottom: 130,
    gap: 12,
  },
  header: {
    gap: 7,
    marginBottom: 6,
  },
  eyebrow: {
    color: HangoutColors.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: HangoutColors.ink,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: HangoutColors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: HangoutColors.line,
    backgroundColor: HangoutColors.surface,
    gap: 9,
  },
  searchIcon: {
    color: HangoutColors.green,
    fontSize: 23,
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    color: HangoutColors.ink,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearSearch: {
    color: HangoutColors.muted,
    fontSize: 24,
    paddingHorizontal: 3,
  },
  filterLabel: {
    color: HangoutColors.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },
  chipRow: {
    gap: 8,
    paddingRight: 20,
  },
  chip: {
    minHeight: 36,
    justifyContent: 'center',
    backgroundColor: HangoutColors.surface,
    borderWidth: 1,
    borderColor: HangoutColors.line,
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  selectedChip: {
    backgroundColor: HangoutColors.green,
    borderColor: HangoutColors.green,
  },
  chipText: {
    color: HangoutColors.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  resultsHeading: {
    marginTop: 11,
    marginBottom: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultsTitle: {
    color: HangoutColors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  resultCount: {
    overflow: 'hidden',
    color: HangoutColors.green,
    backgroundColor: HangoutColors.paleGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '800',
  },
  emptyState: {
    backgroundColor: HangoutColors.surface,
    borderColor: HangoutColors.line,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    padding: 22,
    gap: 8,
  },
  emptyTitle: {
    color: HangoutColors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    color: HangoutColors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: HangoutColors.lime,
    borderRadius: 12,
    marginTop: 5,
  },
  resetButtonText: {
    color: HangoutColors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  disclaimer: {
    color: HangoutColors.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  pressed: {
    opacity: 0.72,
  },
});
