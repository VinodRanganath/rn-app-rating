const {defaults} = require('jest-config');
module.exports = {
  preset: 'react-native',
  moduleFileExtensions: [...defaults.moduleFileExtensions],
  transformIgnorePatterns: [
    'node_modules/(?!react-native|@react-native)',
  ],
};
