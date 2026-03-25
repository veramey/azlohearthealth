import { StyleSheet, Text, View } from 'react-native';

export default function HeartScoreScreen(): JSX.Element {
  // TODO: Implement Heart Score screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Heart Score</Text>
      <Text style={styles.subtitle}>Composite heart health score coming soon</Text>
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
