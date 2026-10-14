import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform, LogBox } from 'react-native';

// Suppress known React 19 + react-native-web responder property warnings (onStartShouldSetResponder, etc.)
LogBox.ignoreLogs([/Unknown event handler property/]);

if (Platform.OS === 'web' && typeof console !== 'undefined') {
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    const firstArg = typeof args[0] === 'string' ? args[0] : '';
    if (firstArg.includes('Unknown event handler property')) {
      return;
    }
    origError(...args);
  };
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaProvider>
  );
}
