# KumulCity
KumulCity is a mobile-first place discovery app focused on Morobe Province, Papua New Guinea. It helps residents and visitors find places for casual hangouts, community events, and formal gatherings. People can browse by area or type, open a map search, and use visitor ratings as local impressions when comparing where to go.

## Features

- Home screen with a "pick for me" suggestion.
- Place search and filters for area, category, and specific outing type or hangout style.
- Map search links for each place.
- Visitor ratings and visit counts to help people compare local gathering spots.
- On-device local profiles with visitor and admin demo roles.
- On-device place management, ratings, and visit counts.
- Morobe-only sample suggestions.
- No people tracking or live location sharing.

The app icon, app splash screen, and in-app brand mark use `assets/images/kumulcity-logo.png`. Expo Go may continue showing its own launcher icon; to see updated native icon/splash settings outside Expo Go, create and install a new native app build.

The included place list is starter content, not a verified directory. Food listings include Wicked Chicken, Big Rooster, Papindo Food Arcade, and Foodmart Restaurant in Lae. Lae International Hotel is listed as a conference centre for professional and social gatherings; confirm room capacity, equipment, catering, and availability with the hotel. Sports listings include Sir Ignatius Kilage Stadium, Lae Football Association Oval, and Lae Rugby League Oval. Coastal suggestions include DCA Beach and Voco Point. Place photos are bundled from `assets/images/` for Lae Botanic Gardens, PNG Unitech Rainforest Habitat, Lae War Cemetery, Bulolo town, Finschhafen, Mt Lunaman Lookout, Sipaya Village, Wicked Chicken, Big Rooster, Papindo Food Arcade, Foodmart Restaurant, Sir Ignatius Kilage Stadium, Lae Football Association Oval, Lae Rugby League Oval, DCA Beach, Voco Point, and Lae International Hotel. Confirm names, exact locations, public access, travel conditions and opening details with local sources before publishing the app.

The explore screen includes category options for food and dining, accommodation, sports and recreation, outdoor and nature, hangout style, professional meetups, and tourist attractions. Add and maintain verified listings in the Admin tab. Categories without listings show a clear empty state.

## Local demo data

No Supabase project, account, `.env` file, or database setup is needed. Create a local profile in the app and choose Visitor or Local admin. Returning profiles can be selected by entering the same email. These profiles have no password and are only a demo convenience—not authentication or access control.

Places, profiles, ratings, and visit counts are saved with AsyncStorage on the device where Expo Go runs. They are not written into the VS Code project folder, uploaded, or synchronized to another device. Uninstalling or clearing app storage can remove them. Do not use this local-only setup for private or production data; use a backend with server-enforced authentication and roles before publishing a multi-user app.

## Run locally

```sh
npm install
npx expo start
```

Run the app checks with:

```sh
npx expo lint
npx tsc --noEmit
```
