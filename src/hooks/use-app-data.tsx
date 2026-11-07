import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { HangoutPlace } from '@/constants/hangout-places';
import { useAuth } from '@/hooks/use-auth';

export type PlaceRecord = HangoutPlace & {
  categoryGroup: string;
  averageRating: number | null;
  ratingCount: number;
  visitCount: number;
  userRating: number | null;
  userVisited: boolean;
};

export type PlaceInput = Omit<HangoutPlace, 'id' | 'marker'> & {
  categoryGroup: string;
};

type LocalRating = { placeId: string; userId: string; rating: number };
type LocalVisit = { placeId: string; userId: string };
type StoredData = {
  places: LocalPlace[];
  ratings: LocalRating[];
  visits: LocalVisit[];
};
type LocalPlace = HangoutPlace & { categoryGroup: string };
type PlaceImageKey = NonNullable<HangoutPlace['imageKey']>;

type PlaceContextValue = {
  places: PlaceRecord[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  savePlace: (input: PlaceInput, id?: string) => Promise<void>;
  deletePlace: (id: string) => Promise<void>;
  ratePlace: (id: string, rating: number) => Promise<void>;
  recordVisit: (id: string) => Promise<void>;
};

const DATA_KEY = 'kumulcity.local.data.v1';
const PlaceContext = createContext<PlaceContextValue | null>(null);

const STARTER_IMAGE_KEYS: Partial<Record<string, PlaceImageKey>> = {
  'lae-botanic-gardens': 'lae-botanic-gardens',
  'png-unitech-rainforest-habitat': 'unitech-rainforest-habitat',
  'lae-city-centre': 'lae-war-cemetery',
  'bulolo-town': 'bulolo-town',
  finschhafen: 'finschhafen',
  'mt-lunaman-lookout': 'mt-lunaman-lookout',
  'sipaya-village': 'sipaya-village',
  'wicked-chicken': 'wicked-chicken',
  'big-rooster': 'big-rooster',
  'papindo-food-arcade': 'papindo-food-arcade',
  'foodmart-restaurant': 'foodmart-restaurant',
  'sir-ignatius-kilage-stadium': 'sir-ignatius-kilage-stadium',
  'lae-football-association-oval': 'lae-football-association-oval',
  'lae-rugby-league-oval': 'lae-rugby-league-oval',
  'dca-beach': 'dca-beach',
  'voco-point': 'voco-point',
  'lae-international-hotel': 'lae-international-hotel',
};

const STARTER_PLACE_IDS_TO_MERGE = new Set([
  'lae-botanic-gardens',
  'png-unitech-rainforest-habitat',
  'lae-city-centre',
  'mt-lunaman-lookout',
  'sipaya-village',
  'wicked-chicken',
  'big-rooster',
  'papindo-food-arcade',
  'foodmart-restaurant',
  'sir-ignatius-kilage-stadium',
  'lae-football-association-oval',
  'lae-rugby-league-oval',
  'dca-beach',
  'voco-point',
  'lae-international-hotel',
]);

const STARTER_PLACES: LocalPlace[] = [
  {
    id: 'lae-botanic-gardens',
    name: 'Lae Botanic Gardens',
    area: 'Lae',
    categoryGroup: 'Outdoor & Nature',
    placeType: 'Nature',
    category: 'Gardens',
    hangoutStyles: ['Family Friendly', 'Solo Relaxation'],
    description: 'A green-space suggestion for a relaxed catch-up.',
    marker: 'G',
    imageKey: 'lae-botanic-gardens',
  },
  {
    id: 'png-unitech-rainforest-habitat',
    name: 'PNG Unitech Rainforest Habitat',
    area: 'Lae',
    categoryGroup: 'Outdoor & Nature',
    placeType: 'Nature',
    category: 'Gardens',
    hangoutStyles: ['Family Friendly', 'Solo Relaxation'],
    description:
      'A rainforest habitat at PNG University of Technology in Lae. Confirm opening times, access, and visitor arrangements with the university before visiting.',
    marker: 'R',
    imageKey: 'unitech-rainforest-habitat',
  },
  {
    id: 'lae-city-centre',
    name: 'Lae War Cemetery',
    area: 'Lae',
    categoryGroup: 'Tourist Attractions',
    placeType: 'Town',
    category: 'Historical Sites',
    description:
      'A place of remembrance in Lae. Please be respectful and confirm visitor access before visiting.',
    marker: 'W',
    imageKey: 'lae-war-cemetery',
  },
  {
    id: 'salamaua',
    name: 'Salamaua',
    area: 'Salamaua',
    categoryGroup: 'Outdoor & Nature',
    placeType: 'Coast',
    description: 'A coastal destination to consider for a day out.',
    marker: 'S',
  },
  {
    id: 'bulolo-town',
    name: 'Bulolo town',
    area: 'Bulolo',
    categoryGroup: 'Hangout Style',
    placeType: 'Town',
    hangoutStyles: ['Casual Hangout', 'Group Hangout'],
    description: 'A township meet-up idea in the Bulolo area.',
    marker: 'B',
    imageKey: 'bulolo-town',
  },
  {
    id: 'finschhafen',
    name: 'Finschhafen',
    area: 'Finschhafen',
    categoryGroup: 'Outdoor & Nature',
    placeType: 'Coast',
    description: 'A coastal area to explore with your group.',
    marker: 'F',
    imageKey: 'finschhafen',
  },
  {
    id: 'mt-lunaman-lookout',
    name: 'Mt Lunaman Lookout',
    area: 'Lae',
    categoryGroup: 'Outdoor & Nature',
    placeType: 'Nature',
    category: 'Hiking Trails',
    hangoutStyles: ['Group Hangout', 'Solo Relaxation'],
    description:
      'A lookout spot in Lae. Check local access and trail conditions before setting out.',
    marker: 'L',
    imageKey: 'mt-lunaman-lookout',
  },
  {
    id: 'sipaya-village',
    name: 'Sipaya Village',
    area: 'Lae',
    categoryGroup: 'Tourist Attractions',
    placeType: 'Town',
    category: 'Cultural Centres',
    description:
      'A village community. Please contact local residents and confirm permission and visitor access before visiting.',
    marker: 'S',
    imageKey: 'sipaya-village',
  },
  {
    id: 'wicked-chicken',
    name: 'Wicked Chicken',
    area: 'Lae',
    categoryGroup: 'Food & Dining',
    placeType: 'Town',
    category: 'Fast Food',
    description:
      'A fast-food dining option in Lae. Confirm current location and opening hours before visiting.',
    marker: 'W',
    imageKey: 'wicked-chicken',
  },
  {
    id: 'big-rooster',
    name: 'Big Rooster',
    area: 'Lae',
    categoryGroup: 'Food & Dining',
    placeType: 'Town',
    category: 'Fast Food',
    description:
      'A fast-food dining option in Lae. Confirm current location and opening hours before visiting.',
    marker: 'B',
    imageKey: 'big-rooster',
  },
  {
    id: 'papindo-food-arcade',
    name: 'Papindo Food Arcade',
    area: 'Lae',
    categoryGroup: 'Food & Dining',
    placeType: 'Town',
    category: 'Restaurants',
    description:
      'A food arcade in Lae. Confirm current location and opening hours before visiting.',
    marker: 'P',
    imageKey: 'papindo-food-arcade',
  },
  {
    id: 'foodmart-restaurant',
    name: 'Foodmart Restaurant',
    area: 'Lae',
    categoryGroup: 'Food & Dining',
    placeType: 'Town',
    category: 'Restaurants',
    description:
      'A restaurant in Lae. Confirm current location and opening hours before visiting.',
    marker: 'F',
    imageKey: 'foodmart-restaurant',
  },
  {
    id: 'sir-ignatius-kilage-stadium',
    name: 'Sir Ignatius Kilage Stadium',
    area: 'Lae',
    categoryGroup: 'Sports & Recreation',
    placeType: 'Town',
    category: 'Stadiums',
    description:
      'A stadium in Lae. Check event schedules, access, and entry requirements before visiting.',
    marker: 'S',
    imageKey: 'sir-ignatius-kilage-stadium',
  },
  {
    id: 'lae-football-association-oval',
    name: 'Lae Football Association Oval',
    area: 'Lae',
    categoryGroup: 'Sports & Recreation',
    placeType: 'Town',
    category: 'Sports Grounds',
    description:
      'A football ground in Lae. Check event schedules and visitor access before visiting.',
    marker: 'F',
    imageKey: 'lae-football-association-oval',
  },
  {
    id: 'lae-rugby-league-oval',
    name: 'Lae Rugby League Oval',
    area: 'Lae',
    categoryGroup: 'Sports & Recreation',
    placeType: 'Town',
    category: 'Sports Grounds',
    description:
      'A rugby league ground in Lae. Check event schedules and visitor access before visiting.',
    marker: 'R',
    imageKey: 'lae-rugby-league-oval',
  },
  {
    id: 'dca-beach',
    name: 'DCA Beach',
    area: 'Lae',
    categoryGroup: 'Outdoor & Nature',
    placeType: 'Coast',
    category: 'Beaches',
    description:
      'A beach area near Lae. Confirm local access, weather, and water conditions before visiting.',
    marker: 'D',
    imageKey: 'dca-beach',
  },
  {
    id: 'voco-point',
    name: 'Voco Point',
    area: 'Lae',
    categoryGroup: 'Outdoor & Nature',
    placeType: 'Coast',
    category: 'Beaches',
    description:
      'A coastal spot in Lae. Confirm local access, weather, and water conditions before visiting.',
    marker: 'V',
    imageKey: 'voco-point',
  },
  {
    id: 'lae-international-hotel',
    name: 'Lae International Hotel',
    area: 'Lae',
    categoryGroup: 'Professional',
    placeType: 'Town',
    category: 'Conference Centres',
    description:
      'The hotel has a conference room suitable for professional meetings, conferences, and social gatherings. Contact the hotel to confirm room capacity, equipment, catering, and availability.',
    marker: 'L',
    imageKey: 'lae-international-hotel',
  },
];

function makePlaceId(name: string) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseStoredData(value: string | null): StoredData {
  if (!value) return { places: STARTER_PLACES, ratings: [], visits: [] };
  const parsed: unknown = JSON.parse(value);
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('places' in parsed) ||
    !Array.isArray(parsed.places) ||
    !('ratings' in parsed) ||
    !Array.isArray(parsed.ratings) ||
    !('visits' in parsed) ||
    !Array.isArray(parsed.visits)
  ) {
    throw new Error('Saved local place data is invalid.');
  }
  const savedData = parsed as StoredData;
  const updatedSavedPlaces = savedData.places.filter(
    (savedPlace) => savedPlace.id !== 'wau-town',
  ).map((savedPlace) => {
    if (savedPlace.id === 'lae-city-centre') {
      return {
        ...savedPlace,
        ...(savedPlace.name === 'Lae city centre'
          ? {
              name: 'Lae War Cemetery',
              categoryGroup: 'Tourist Attractions',
              category: 'Historical Sites' as const,
              hangoutStyles: [],
              description:
                'A place of remembrance in Lae. Please be respectful and confirm visitor access before visiting.',
              marker: 'W',
            }
          : {}),
        imageKey: 'lae-war-cemetery' as const,
      };
    }
    if (savedPlace.id === 'lae-international-hotel') {
      return {
        ...savedPlace,
        categoryGroup: 'Professional',
        category: 'Conference Centres' as const,
        description:
          'The hotel has a conference room suitable for professional meetings, conferences, and social gatherings. Contact the hotel to confirm room capacity, equipment, catering, and availability.',
      };
    }
    if (savedPlace.id === 'sipaya-village') {
      return { ...savedPlace, area: 'Lae' };
    }
    return savedPlace;
  }).map((savedPlace) => {
    const imageKey = STARTER_IMAGE_KEYS[savedPlace.id];
    return imageKey ? { ...savedPlace, imageKey } : savedPlace;
  });
  const newlyAddedPlaces = STARTER_PLACES.filter(
    (starterPlace) =>
      STARTER_PLACE_IDS_TO_MERGE.has(starterPlace.id) &&
      !updatedSavedPlaces.some((savedPlace) => savedPlace.id === starterPlace.id),
  );
  return {
    ...savedData,
    places: [...updatedSavedPlaces, ...newlyAddedPlaces],
    ratings: savedData.ratings.filter((rating) => rating.placeId !== 'wau-town'),
    visits: savedData.visits.filter((visit) => visit.placeId !== 'wau-town'),
  };
}

function makeRecords(data: StoredData, userId: string): PlaceRecord[] {
  return data.places.map((place) => {
    const ratings = data.ratings.filter((item) => item.placeId === place.id);
    const total = ratings.reduce((sum, item) => sum + item.rating, 0);
    return {
      ...place,
      averageRating: ratings.length ? total / ratings.length : null,
      ratingCount: ratings.length,
      visitCount: data.visits.filter((item) => item.placeId === place.id).length,
      userRating: ratings.find((item) => item.userId === userId)?.rating ?? null,
      userVisited: data.visits.some(
        (item) => item.placeId === place.id && item.userId === userId,
      ),
    };
  });
}

export function AppDataProvider({ children }: PropsWithChildren) {
  const { user, role } = useAuth();
  const [data, setData] = useState<StoredData>({
    places: STARTER_PLACES,
    ratings: [],
    visits: [],
  });
  const [places, setPlaces] = useState<PlaceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(async (nextData: StoredData) => {
    await AsyncStorage.setItem(DATA_KEY, JSON.stringify(nextData));
    setData(nextData);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const saved = await AsyncStorage.getItem(DATA_KEY);
      const nextData = parseStoredData(saved);
      await AsyncStorage.setItem(DATA_KEY, JSON.stringify(nextData));
      setData(nextData);
      setPlaces(user ? makeRecords(nextData, user.id) : []);
    } catch (loadError) {
      console.error('Unable to load local KumulCity data.', loadError);
      setError('Could not load saved places. Restart the app and try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (role && user) void refresh();
    else setPlaces([]);
  }, [role, user, refresh]);

  const savePlace = useCallback(
    async (input: PlaceInput, id?: string) => {
      if (role !== 'admin') throw new Error('Switch to a local admin profile to manage places.');
      const placeId = id ?? makePlaceId(input.name);
      const existing = data.places.find((place) => place.id === placeId);
      const nextPlace: LocalPlace = {
        ...input,
        id: placeId,
        name: input.name.trim(),
        area: input.area.trim(),
        description: input.description.trim(),
        marker: existing?.marker ?? input.name.trim().charAt(0).toUpperCase(),
      };
      const nextData = {
        ...data,
        places: existing
          ? data.places.map((place) => (place.id === placeId ? nextPlace : place))
          : [...data.places, nextPlace],
      };
      await persist(nextData);
      setPlaces(makeRecords(nextData, user?.id ?? ''));
    },
    [data, role, persist, user],
  );

  const deletePlace = useCallback(
    async (id: string) => {
      if (role !== 'admin') throw new Error('Switch to a local admin profile to manage places.');
      const nextData: StoredData = {
        places: data.places.filter((place) => place.id !== id),
        ratings: data.ratings.filter((rating) => rating.placeId !== id),
        visits: data.visits.filter((visit) => visit.placeId !== id),
      };
      await persist(nextData);
      setPlaces(makeRecords(nextData, user?.id ?? ''));
    },
    [data, role, persist, user],
  );

  const ratePlace = useCallback(
    async (id: string, rating: number) => {
      if (!user || role !== 'visitor') {
        throw new Error('Sign in with a visitor profile to rate places.');
      }
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error('Ratings must be between 1 and 5 stars.');
      }
      const nextData: StoredData = {
        ...data,
        ratings: [
          ...data.ratings.filter((item) => !(item.placeId === id && item.userId === user.id)),
          { placeId: id, userId: user.id, rating },
        ],
      };
      await persist(nextData);
      setPlaces(makeRecords(nextData, user.id));
    },
    [data, role, persist, user],
  );

  const recordVisit = useCallback(
    async (id: string) => {
      if (!user || role !== 'visitor') {
        throw new Error('Sign in with a visitor profile to record a visit.');
      }
      if (data.visits.some((visit) => visit.placeId === id && visit.userId === user.id)) {
        throw new Error('You have already recorded a visit to this place.');
      }
      const nextData: StoredData = {
        ...data,
        visits: [...data.visits, { placeId: id, userId: user.id }],
      };
      await persist(nextData);
      setPlaces(makeRecords(nextData, user.id));
    },
    [data, role, persist, user],
  );

  const value = useMemo(
    () => ({ places, loading, error, refresh, savePlace, deletePlace, ratePlace, recordVisit }),
    [places, loading, error, refresh, savePlace, deletePlace, ratePlace, recordVisit],
  );

  return <PlaceContext.Provider value={value}>{children}</PlaceContext.Provider>;
}

export function useAppData() {
  const context = useContext(PlaceContext);
  if (!context) throw new Error('useAppData must be used within an AppDataProvider.');
  return context;
}
