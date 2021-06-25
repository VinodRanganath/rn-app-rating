import React from 'react';
import {Button} from 'react-native';
import {HomeContainer} from './Home.styles';
import {RNAppRating} from 'rn-app-rating';

const Home = () => {
  const {showRNAppRatingPrompt} = RNAppRating();

  return (
    <HomeContainer>
      <Button
        title="Show RNAppRating prompt"
        onPress={() =>
          showRNAppRatingPrompt(response =>
            console.log('successCallback', response),
          )
        }
      />
    </HomeContainer>
  );
};

export default Home;
