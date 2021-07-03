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

    // update values
    const {launchTimes, rateLater, launchTimesPostRateLater, rateLaterOn} = storageValue;
    const {minimumAppLaunchTimesPostRateLater, minimumAppInstalledDaysPostRateLater} = rules;
    storageValue = {...storageValue, launchTimes: launchTimes + 1};
    if (rateLater) {
      const currentLaunchTimesPostRateLater = launchTimesPostRateLater + 1;
      if (
        currentLaunchTimesPostRateLater >= minimumAppLaunchTimesPostRateLater &&
        daysElapsed(rateLaterOn) >= minimumAppInstalledDaysPostRateLater
      ) {
        storageValue = {...storageValue, rateLater: false, launchTimesPostRateLater: 0, rateLaterOn: 0};
      } else {
        storageValue = {...storageValue, launchTimesPostRateLater: currentLaunchTimesPostRateLater};
      }
    }

    await setRNAppRatingStorageValue(storageValue);
    return storageValue;
  };

  const validateRules = async () => {
    const storageValue = await getRNAppRatingStorageValue();
    const {launchTimes, installedOn, rateLater, launchTimesPostRateLater, rateLaterOn, rateNever} = storageValue;
    const {
      minimumAppLaunchTimes,
      minimumAppInstalledDays,
      minimumAppLaunchTimesPostRateLater,
      minimumAppInstalledDaysPostRateLater,
    } = rules;
    let ruleBroken = false;

    if (!rateNever) {
      if (launchTimes < minimumAppLaunchTimes || daysElapsed(installedOn) < minimumAppInstalledDays) ruleBroken = true;
      if (
        rateLater &&
        (launchTimesPostRateLater < minimumAppLaunchTimesPostRateLater ||
          daysElapsed(rateLaterOn) < minimumAppInstalledDaysPostRateLater)
      ) {
        ruleBroken = true;
      }
    } else {
      ruleBroken = true;
    }

    return !ruleBroken;
  };

  const setRateLater = async () => {
    let storageValue = await getRNAppRatingStorageValue();
    storageValue = {
      ...storageValue,
      rateLater: true,
      rateLaterOn: moment.utc().valueOf(),
      rateLaterClicks: storageValue.rateLaterClicks + 1,
    };
    await setRNAppRatingStorageValue(storageValue);
  };

  const setRateNever = async () => {
    let storageValue = await getRNAppRatingStorageValue();
    storageValue = {...storageValue, rateNever: true};
    await setRNAppRatingStorageValue(storageValue);
  };

  const validateShowRateNever = async () => {
    const storageValue = await getRNAppRatingStorageValue();
    return storageValue.rateLaterClicks >= rules.minimumRateLaterClicksToShowRateNever;
  };

  return {initRNAppRatingStorage, validateRules, setRateLater, setRateNever, validateShowRateNever};
};

export default useRuleManager;
