import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function MetricTrendScreen(): JSX.Element {
  const { metric } = useLocalSearchParams<{ metric: string }>();

  // TODO: Implement individual metric trend detail screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trend Detail</Text>
      <Text style={styles.metric}>Metric: {metric}</Text>
      <Text style={styles.subtitle}>Detailed trend chart coming soon</Text>
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
  metric: {
    fontSize: 18,
    color: '#E53E3E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
