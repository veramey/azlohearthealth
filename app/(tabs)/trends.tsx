import { StyleSheet, Text, View } from 'react-native';

export default function TrendsScreen(): JSX.Element {
  // TODO: Implement Trends screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trends</Text>
      <Text style={styles.subtitle}>Metric trends over time coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
