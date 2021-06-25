import React from 'react';
import {RNAppRatingProvider} from 'rn-app-rating';
import {Home} from './screens';
import {AppContainer} from './styles';

const App = () => {
  return (
    <AppContainer>
      <RNAppRatingProvider>
        <Home />
      </RNAppRatingProvider>
    </AppContainer>
  );
};

export default App;
