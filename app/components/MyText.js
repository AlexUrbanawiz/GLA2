// MyText.js
import { StyleSheet, Text } from "react-native";

export default function MyText({
  children,
  size = 16,
  color = "black",
  bold = false,
}) {
  return (
    <Text
      style={[
        styles.text,
        { fontSize: size, color, fontWeight: bold ? "bold" : "normal" },
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    margin: 5,
  },
});

// Calculator basic functions
// adding function

function Add(numOne, numTwo) {
  const addTotal = numOne + numTwo;
  return addTotal;
}

// multiplier function
function Multiplier(multiple, baseNumber) {
  const multiplierTotalTotal = multiple * baseNumber;
  return multiplierTotal;
}

// subtration function
function subtractNum(numOne, numTwo) {
  const subtractTotal = numOne - numTwo;
  return subtractTotal;
}
