import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0D0D0D' },
        headerTintColor: '#E5E5E5',
        contentStyle: { backgroundColor: '#0D0D0D' },
      }}
    />
  );
}
