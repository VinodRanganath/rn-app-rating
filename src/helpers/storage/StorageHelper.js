import AsyncStorage from '@react-native-async-storage/async-storage';
import {LOG_LEVELS} from '../../constants';
import Logger from '../logger/Logger';

const StorageHelper = () => {
  const {getItem, setItem, removeItem} = AsyncStorage;

  const saveInStorage = (key, value) =>
    new Promise(async (resolve, reject) => {
      try {
        await setItem(key, JSON.stringify(value));
        resolve();
      } catch (err) {
        Logger.log(`storage: save failed with, ${err}`, LOG_LEVELS.ERROR);
        reject(err);
      }
    });

  const getFromStorage = key =>
    new Promise(async (resolve, reject) => {
      try {
        const value = await getItem(key);
        resolve(value ? JSON.parse(value) : null);
      } catch (err) {
        Logger.log(`storage: get failed with, ${err}`, LOG_LEVELS.ERROR);
        reject(err);
      }
    });

  const removeFromStorage = key =>
    new Promise(async (resolve, reject) => {
      try {
        await removeItem(key);
        resolve();
      } catch (err) {
        Logger.log(`storage: delete failed with, ${err}`, LOG_LEVELS.ERROR);
        reject(err);
      }
    });

  return {
    saveInStorage,
    getFromStorage,
    removeFromStorage,
  };
};

export default StorageHelper;
