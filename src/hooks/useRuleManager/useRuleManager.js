import StorageHelper from '../../helpers/storage/StorageHelper';
import {INITIAL_RN_APP_RATING_STORAGE_VALUE, RN_APP_RATING_STORAGE_KEY} from '../../constants';
import {useContext} from 'react';
import {RNAppRatingContext} from '../../provider';
import moment from 'moment';

const useRuleManager = () => {
  const {getFromStorage, saveInStorage} = StorageHelper();
  const {
    config: {rules},
  } = useContext(RNAppRatingContext);

  const getRNAppRatingStorageValue = () => getFromStorage(RN_APP_RATING_STORAGE_KEY);

  const setRNAppRatingStorageValue = value => saveInStorage(RN_APP_RATING_STORAGE_KEY, value);

  const daysElapsed = sinceTimestamp => {
    if (moment(sinceTimestamp).isAfter(moment())) return -1;
    return moment.duration(moment().diff(moment(sinceTimestamp))).days();
  };

  const initRNAppRatingStorage = async () => {
    let storageValue = await getRNAppRatingStorageValue();

    // initialise values
    if (!storageValue) {
      await setRNAppRatingStorageValue(INITIAL_RN_APP_RATING_STORAGE_VALUE);
      return await getRNAppRatingStorageValue();
    }

    // Return if rateNever=true or ratingGiven=true
    if (storageValue?.rateNever || storageValue?.ratingGiven) return;

    // update values
    const {launchTimes, rateLater, launchTimesPostRateLater, rateLaterOn} = storageValue;
    const {minimumAppLaunchesSinceRateLater, minimumDaysSinceRateLater} = rules;
    storageValue = {...storageValue, launchTimes: launchTimes + 1};
    if (rateLater) {
      const currentLaunchTimesPostRateLater = launchTimesPostRateLater + 1;
      if (
        currentLaunchTimesPostRateLater >= minimumAppLaunchesSinceRateLater &&
        daysElapsed(rateLaterOn) >= minimumDaysSinceRateLater
      ) {
        storageValue = {...storageValue, rateLater: false, launchTimesPostRateLater: 0, rateLaterOn: null};
      } else {
        storageValue = {...storageValue, launchTimesPostRateLater: currentLaunchTimesPostRateLater};
      }
    }

    await setRNAppRatingStorageValue(storageValue);
    return storageValue;
  };

  const rulesSatisfied = async () => {
    const storageValue = await getRNAppRatingStorageValue();
    // Return false if not value is found in storage or rateNever=true or ratingGiven=true
    if (!storageValue || storageValue?.rateNever || storageValue?.ratingGiven) return false;

    const {launchTimes, installedOn, rateLater, launchTimesPostRateLater, rateLaterOn} = storageValue;
    const {minimumAppLaunches, minimumAppInstalledDays, minimumAppLaunchesSinceRateLater, minimumDaysSinceRateLater} =
      rules;
    if (
      rateLater &&
      (launchTimesPostRateLater < minimumAppLaunchesSinceRateLater ||
        daysElapsed(rateLaterOn) < minimumDaysSinceRateLater)
    ) {
      return false;
    }
    if (launchTimes < minimumAppLaunches || daysElapsed(installedOn) < minimumAppInstalledDays) {
      return false;
    }
    return true;
  };

  const updateStorage = async param => {
    let storageValue = await getRNAppRatingStorageValue();
    const additionalParams = param?.rateLater
      ? {rateLaterOn: moment.utc().valueOf(), rateLaterClicks: storageValue.rateLaterClicks + 1}
      : {};
    storageValue = {...storageValue, ...param, ...additionalParams};
    await setRNAppRatingStorageValue(storageValue);
  };

  const setRateLater = () => updateStorage({rateLater: true});

  const setRateNever = () => updateStorage({rateNever: true});

  const setRatingGiven = () => updateStorage({ratingGiven: true});

  const canShowRateNever = async () => {
    const storageValue = await getRNAppRatingStorageValue();
    return storageValue.rateLaterClicks >= rules.minimumRateLaterClicksToShowRateNever;
  };

  return {initRNAppRatingStorage, rulesSatisfied, setRateLater, setRateNever, setRatingGiven, canShowRateNever};
};

export default useRuleManager;
