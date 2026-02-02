// MyText.js
import { StyleSheet, Text } from 'react-native';

export default function MyText({ children, size = 16, color = 'black', bold = false }) {
  return (
    <Text style={[styles.text, { fontSize: size, color, fontWeight: bold ? 'bold' : 'normal' }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    margin: 5,
  },
});
