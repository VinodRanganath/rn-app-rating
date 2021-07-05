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

  // TODO: Rename validateRules to rulesSatisfied
  // TODO: Refactor method
  const validateRules = async () => {
    const storageValue = await getRNAppRatingStorageValue();
    if (storageValue) {
      const {launchTimes, installedOn, rateLater, launchTimesPostRateLater, rateLaterOn, rateNever} = storageValue;
      const {minimumAppLaunches, minimumAppInstalledDays, minimumAppLaunchesSinceRateLater, minimumDaysSinceRateLater} =
        rules;
      let ruleBroken = false;

      if (!rateNever) {
        if (launchTimes < minimumAppLaunches || daysElapsed(installedOn) < minimumAppInstalledDays) {
          ruleBroken = true;
        }
        if (
          rateLater &&
          (launchTimesPostRateLater < minimumAppLaunchesSinceRateLater ||
            daysElapsed(rateLaterOn) < minimumDaysSinceRateLater)
        ) {
          ruleBroken = true;
        }
      } else {
        ruleBroken = true;
      }

      return !ruleBroken;
    }
    return false;
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

  const canShowRateNever = async () => {
    const storageValue = await getRNAppRatingStorageValue();
    return storageValue.rateLaterClicks >= rules.minimumRateLaterClicksToShowRateNever;
  };

  return {initRNAppRatingStorage, validateRules, setRateLater, setRateNever, canShowRateNever};
};

export default useRuleManager;
