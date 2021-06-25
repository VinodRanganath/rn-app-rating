import React from 'react';
import {RNAppRatingProvider} from './provider/RNAppRatingProvider';
import RNAppRatingComponent from './components/RNAppRatingComponent';

const RNAppRatingPrompt = () => {
  return (
    <RNAppRatingProvider>
      <RNAppRatingComponent />
    </RNAppRatingProvider>
  );
};

export default RNAppRatingPrompt;
