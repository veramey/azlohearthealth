import { View, Text, StyleSheet } from "react-native";

export default function HeartScoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Heart Score</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#E5E5E5",
    fontSize: 18,
  },
});
