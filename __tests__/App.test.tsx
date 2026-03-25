import React from 'react';
import { render, screen } from '@testing-library/react-native';

// Import one of the tab screen components for a smoke test
import DashboardScreen from '../app/(tabs)/index';

describe('App smoke tests', () => {
  it('renders DashboardScreen without crashing', () => {
    // TODO: Add more specific assertions as components are implemented
    render(<DashboardScreen />);
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });
});
