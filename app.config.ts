import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Azlo",
  slug: "azlohearthealth",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0D0D0D",
  },
  ios: {
    bundleIdentifier: "com.azlo.hearthealth",
    deploymentTarget: "16.0",
    supportsTablet: false,
    infoPlist: {
      NSHealthShareUsageDescription:
        "Azlo reads your health data to display heart health trends and insights.",
      NSHealthUpdateUsageDescription:
        "Azlo writes blood pressure readings you enter manually back to Apple Health.",
    },
    entitlements: {
      "com.apple.developer.healthkit": true,
    },
  },
  plugins: [
    "expo-router",
    "expo-dev-client",
    [
      "react-native-health",
      {
        isClinicalDataEnabled: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  scheme: "azlo",
});
