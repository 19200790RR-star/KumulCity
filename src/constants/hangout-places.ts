export const HANGOUT_CATEGORIES = [
  {
    name: 'Food & Dining',
    options: ['Restaurants', 'Cafes', 'Fast Food', 'Street Food'],
  },
  {
    name: 'Accommodation',
    options: ['Hotels', 'Lodges'],
  },
  {
    name: 'Sports & Recreation',
    options: ['Stadiums', 'Sports Grounds'],
  },
  {
    name: 'Outdoor & Nature',
    options: ['Parks', 'Beaches', 'Gardens', 'Hiking Trails'],
  },
  {
    name: 'Hangout Style',
    options: [
      'Casual Hangout',
      'Family Friendly',
      'Romantic Spots',
      'Group Hangout',
      'Solo Relaxation',
    ],
  },
  {
    name: 'Professional',
    options: ['Business Meeting Spots', 'Conference Centres', 'Co-working Spaces'],
  },
  {
    name: 'Tourist Attractions',
    options: ['Historical Sites', 'Cultural Centres', 'Museums', 'Landmarks'],
  },
] as const;

export type HangoutCategoryGroup = (typeof HANGOUT_CATEGORIES)[number]['name'];
export type HangoutCategory = (typeof HANGOUT_CATEGORIES)[number]['options'][number];
export type HangoutStyle = Extract<
  HangoutCategory,
  | 'Casual Hangout'
  | 'Family Friendly'
  | 'Romantic Spots'
  | 'Group Hangout'
  | 'Solo Relaxation'
>;

export type HangoutPlace = {
  id: string;
  name: string;
  area: string;
  placeType: 'Nature' | 'Coast' | 'Town';
  category?: HangoutCategory;
  hangoutStyles?: HangoutStyle[];
  description: string;
  marker: string;
  imageKey?:
    | 'unitech-rainforest-habitat'
    | 'lae-botanic-gardens'
    | 'lae-war-cemetery'
    | 'bulolo-town'
    | 'finschhafen'
    | 'mt-lunaman-lookout'
    | 'sipaya-village'
    | 'wicked-chicken'
    | 'big-rooster'
    | 'papindo-food-arcade'
    | 'foodmart-restaurant'
    | 'sir-ignatius-kilage-stadium'
    | 'lae-football-association-oval'
    | 'lae-rugby-league-oval'
    | 'dca-beach'
    | 'voco-point'
    | 'lae-international-hotel';
};
