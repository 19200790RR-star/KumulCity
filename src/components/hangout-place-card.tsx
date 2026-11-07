import * as Linking from 'expo-linking';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppData, type PlaceRecord } from '@/hooks/use-app-data';
import { useAuth } from '@/hooks/use-auth';

export const HangoutColors = {
  background: '#F6F5EF',
  surface: '#FFFFFF',
  ink: '#172D26',
  muted: '#78817B',
  green: '#246B4B',
  paleGreen: '#E8F1E8',
  lime: '#D5ED86',
  line: '#E7E9E2',
  coral: '#F1A27F',
} as const;

type HangoutPlaceCardProps = {
  place: PlaceRecord;
};

const PLACE_IMAGE_SOURCES = {
  'unitech-rainforest-habitat': require('@/assets/images/pngunitechrainforesthabitat2.jpg'),
  'lae-botanic-gardens': require('@/assets/images/laebotanicalgarden.jpg'),
  'lae-war-cemetery': require('@/assets/images/laecitywarcemetry.jpg'),
  'bulolo-town': require('@/assets/images/bulolotown.jpg'),
  finschhafen: require('@/assets/images/finschhafen-warabutaweng.jpg'),
  'mt-lunaman-lookout': require('@/assets/images/Mt Lunaman Lookout.jpg'),
  'sipaya-village': require('@/assets/images/sipayavillage.jpg'),
  'wicked-chicken': require('@/assets/images/Wickid Chicken.jpg'),
  'big-rooster': require('@/assets/images/bigroosterlae.png'),
  'papindo-food-arcade': require('@/assets/images/Papindo Food Arcade.jpg'),
  'foodmart-restaurant': require('@/assets/images/foodmartrestaurent.webp'),
  'sir-ignatius-kilage-stadium': require('@/assets/images/Sir Ignatius Kilage Stadium.jpg'),
  'lae-football-association-oval': require('@/assets/images/Lae Football Association Oval.jpg'),
  'lae-rugby-league-oval': require('@/assets/images/Lae Rugby League Oval.jpg'),
  'dca-beach': require('@/assets/images/DCA Beach.jpg'),
  'voco-point': require('@/assets/images/Voco Point.jpg'),
  'lae-international-hotel': require('@/assets/images/Lae International Hotel.jpg'),
} satisfies Record<NonNullable<PlaceRecord['imageKey']>, number>;

export function HangoutPlaceCard({ place }: HangoutPlaceCardProps) {
  const [mapError, setMapError] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const { role } = useAuth();
  const { ratePlace, recordVisit } = useAppData();

  async function submitFeedback(action: () => Promise<void>) {
    setFeedbackError(null);
    setSubmittingFeedback(true);
    try {
      await action();
    } catch (error) {
      console.error('Unable to save place feedback.', error);
      setFeedbackError(error instanceof Error ? error.message : 'Could not save your feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  }

  async function openMap() {
    setMapError(false);
    const query = encodeURIComponent(
      `${place.name}, ${place.area}, Morobe Province, Papua New Guinea`,
    );

    try {
      await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    } catch (error) {
      console.error('Unable to open map for hangout place.', error);
      setMapError(true);
    }
  }

  return (
    <View style={styles.card}>
      {place.imageKey && (
        <Image
          accessibilityLabel={`Photo of ${place.name}`}
          contentFit="cover"
          source={PLACE_IMAGE_SOURCES[place.imageKey]}
          style={styles.placeImage}
        />
      )}
      <View style={styles.cardTop}>
        <View style={styles.marker}>
          <Text style={styles.markerText}>{place.marker}</Text>
          <View style={styles.markerDot} />
        </View>
        <View style={styles.placeInfo}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{place.category ?? place.placeType}</Text>
          </View>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeArea}>{place.area}, Morobe</Text>
        </View>
      </View>
      <Text style={styles.description}>{place.description}</Text>
      {!!place.hangoutStyles?.length && (
        <View style={styles.styleTags}>
          {place.hangoutStyles.slice(0, 2).map((style) => (
            <View key={style} style={styles.styleTag}>
              <Text style={styles.styleTagText}>{style}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.feedbackSection}>
        <View style={styles.feedbackHeading}>
          <Text style={styles.feedbackLabel}>Visitor rating</Text>
          <Text style={styles.feedbackMeta}>
            {place.averageRating !== null
              ? `${place.averageRating.toFixed(1)} / 5 · ${place.ratingCount} ${
                  place.ratingCount === 1 ? 'rating' : 'ratings'
                }`
              : 'No ratings yet'}
          </Text>
        </View>
        <View style={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Rate ${place.name} ${rating} out of 5 stars`}
              accessibilityState={{ selected: place.userRating === rating }}
              disabled={role !== 'visitor' || submittingFeedback}
              key={rating}
              onPress={() => void submitFeedback(() => ratePlace(place.id, rating))}
              style={({ pressed }) => [
                styles.starButton,
                (role !== 'visitor' || place.userVisited || submittingFeedback) &&
                  styles.disabledButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.starText}>
                {place.userRating !== null && rating <= place.userRating
                  ? '★'
                  : '☆'}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.visitRow}>
          <Text style={styles.visitCount}>
            {place.visitCount} visitor {place.visitCount === 1 ? 'visit' : 'visits'}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Record a visit to ${place.name}`}
            disabled={role !== 'visitor' || place.userVisited || submittingFeedback}
            onPress={() => void submitFeedback(() => recordVisit(place.id))}
            style={({ pressed }) => [
              styles.visitButton,
              (role !== 'visitor' || place.userVisited || submittingFeedback) &&
                styles.disabledButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.visitButtonText}>
              {place.userVisited ? 'Visited' : 'I visited'}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.localNote}>
          {role === 'visitor'
            ? 'Ratings and visits are saved on this device.'
            : 'Sign in as a visitor to rate or record a visit.'}
        </Text>
        {feedbackError && (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {feedbackError}
          </Text>
        )}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open map search for ${place.name}`}
        onPress={openMap}
        style={({ pressed }) => [styles.mapButton, pressed && styles.pressed]}>
        <Text style={styles.mapButtonText}>View on map</Text>
        <Text style={styles.mapArrow}>↗</Text>
      </Pressable>
      {mapError && (
        <Text accessibilityRole="alert" style={styles.errorText}>
          Could not open the map. Please try again.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: HangoutColors.surface,
    borderRadius: 22,
    borderColor: HangoutColors.line,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  placeImage: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    backgroundColor: HangoutColors.paleGreen,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  marker: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: HangoutColors.paleGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: HangoutColors.green,
    fontSize: 20,
    fontWeight: '800',
  },
  markerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    right: 9,
    top: 9,
    backgroundColor: HangoutColors.coral,
  },
  placeInfo: {
    flex: 1,
    gap: 3,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: HangoutColors.paleGreen,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginBottom: 2,
  },
  categoryText: {
    color: HangoutColors.green,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  placeName: {
    color: HangoutColors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  placeArea: {
    color: HangoutColors.muted,
    fontSize: 12,
  },
  description: {
    color: HangoutColors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  styleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  styleTag: {
    backgroundColor: '#FFF2E9',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  styleTagText: {
    color: '#895236',
    fontSize: 10,
    fontWeight: '700',
  },
  feedbackSection: {
    backgroundColor: '#FAFAF7',
    borderRadius: 16,
    padding: 12,
    gap: 7,
  },
  feedbackHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedbackLabel: {
    color: HangoutColors.ink,
    fontSize: 12,
    fontWeight: '800',
  },
  feedbackMeta: {
    color: HangoutColors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    minWidth: 34,
    minHeight: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starText: {
    color: '#D4912D',
    fontSize: 25,
    lineHeight: 30,
  },
  visitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  visitCount: {
    flex: 1,
    color: HangoutColors.muted,
    fontSize: 11,
  },
  visitButton: {
    backgroundColor: HangoutColors.paleGreen,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  visitButtonText: {
    color: HangoutColors.green,
    fontSize: 11,
    fontWeight: '800',
  },
  localNote: {
    color: HangoutColors.muted,
    fontSize: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: HangoutColors.background,
  },
  mapButtonText: {
    color: HangoutColors.green,
    fontSize: 13,
    fontWeight: '700',
  },
  mapArrow: {
    color: HangoutColors.green,
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#A33B28',
    fontSize: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
