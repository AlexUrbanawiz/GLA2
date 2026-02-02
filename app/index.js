import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

export default function Home() {
  const [item1, setItem1] = useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/settings')}
              style={{ paddingHorizontal: 12 }}
            >
              <Ionicons name="settings-outline" size={22} />
            </Pressable>
          ),
        }}
      />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Home Screen</Text>
        <Checkbox value={item1} onValueChange={setItem1} />
      </View>
    </>
  );
}
