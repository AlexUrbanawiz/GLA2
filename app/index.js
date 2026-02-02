import Checkbox from 'expo-checkbox';
import { useState } from 'react';
import { Text, View } from 'react-native';
import MyText from './components/MyText';

export default function Home() {
  const [item1, setItem1] = useState(false);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Checkbox value={item1} onValueChange={setItem1} />
      <MyText size={20} color="purple" bold>
        Hello, World!
      </MyText>
    </View>
  );
}
