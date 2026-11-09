# KiKU User Guide

* Open a new terminal and run the following

```bash
Get-NetIPConfiguration
```

* Your exact IPv4Address will need to be added to a list of approved redirect links for my Spotify app of the Spotify for developers website. Therefore, I would need to manually add the redirect URL to this list. You can contact me at nanabyanyiko@gmail.com
* In the frontend(kiku-app) .env, change the Expo Public API URI to match your IPv4Address. For example:

```dotenv
EXPO\_PUBLIC\_API\_URL=http://\*Insert IPv4Address\*:3000
```

* On your mobile device, download Expo Go from the official website, https://expo.dev/go (SDK version 57 specifically)
* Run the frontend app by running the following

```bash
npx expo start --clear
```

* Run the backend(see attached kiku-backend.zip) app by running the following

```bash
npm run start
```

or

```bash
npm run dev
```

* I will also need to add the full names and Spotify email addresses of all test users(at least 2 to be able to test the friends system)

