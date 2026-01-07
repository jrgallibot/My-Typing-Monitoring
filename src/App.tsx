import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Dashboard from './screens/Dashboard';
import Logs from './screens/Logs';
import Privacy from './screens/Privacy';

type Screen = 'Dashboard' | 'Logs' | 'Privacy';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Dashboard');

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Logs':
        return <Logs />;
      case 'Privacy':
        return <Privacy />;
      default:
        return <Dashboard navigation={{navigate}} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

