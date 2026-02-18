// app/_layout.js
import { Stack } from 'expo-router';
import { InventoryProvider } from '../context/InventoryContext';


export default function Layout() {
  return (
    <InventoryProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'GLA',
            headerRight: () => <HeaderButton />,
          }}
          />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="inventory" options={{ title: 'Inventory' }} />
        <Stack.Screen name="grocery_list" options={{ title: 'Grocery List' }} />
        <Stack.Screen name="budget" options={{ title: 'Budget' }} />
        <Stack.Screen name="recipes" options={{ title: 'Recipes' }} />
      </Stack>
    </InventoryProvider>
  );
}

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
