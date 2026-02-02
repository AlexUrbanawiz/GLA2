// app/_layout.js
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerRight: () => <HeaderButton />,
        }}
      />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}

// Your custom header button
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable } from 'react-native';

function HeaderButton() {
  return (
    <Pressable onPress={() => router.push('/settings')} style={{ paddingHorizontal: 12 }}>
      <Ionicons name="settings-outline" size={22} />
    </Pressable>
  );
}
