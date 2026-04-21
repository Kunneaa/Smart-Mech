import { Stack } from "expo-router";
import {useFonts} from 'expo-font'

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'quicksand': require('../assets/fonts/Quicksand-Regular.ttf'),
    'quicksand-light': require('../assets/fonts/Quicksand-Light.ttf'),
    'quicksand-medium': require('../assets/fonts/Quicksand-Medium.ttf'),
    'quicksand-bold': require('../assets/fonts/Quicksand-Bold.ttf'),
    'quicksand-semibold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
  });

  return <Stack screenOptions={{ headerShown: false}}/>;
}
