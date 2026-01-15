import React, {useState, useEffect} from 'react';
import {View, StyleSheet, BackHandler, Alert} from 'react-native';
import Dashboard from './screens/Dashboard';
import Logs from './screens/Logs';
import Privacy from './screens/Privacy';

type Screen = 'Dashboard' | 'Logs' | 'Privacy';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Dashboard');

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (currentScreen !== 'Dashboard') {
        // If not on Dashboard, go back to Dashboard
        setCurrentScreen('Dashboard');
        return true; // Prevent default behavior
      } else {
        // If on Dashboard, show exit confirmation
        Alert.alert(
          'Exit App',
          'Do you want to exit MyTypingMonitor?',
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: 'Exit',
              onPress: () => BackHandler.exitApp(),
            },
          ],
          {cancelable: false}
        );
        return true; // Prevent default behavior
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [currentScreen]);

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setCurrentScreen('Dashboard');
  };

  const navigateToScreen = (screen: string) => {
    if (screen === 'Logs' || screen === 'Privacy' || screen === 'Dashboard') {
      navigate(screen as Screen);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Logs':
        return <Logs navigation={{navigate: navigateToScreen, goBack}} />;
      case 'Privacy':
        return <Privacy navigation={{navigate: navigateToScreen, goBack}} />;
      default:
        return <Dashboard navigation={{navigate: navigateToScreen}} />;
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

