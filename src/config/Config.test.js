import DEFAULT_CONFIG from './Config';

describe('Config tests', () => {
  it('should have default configurations and match snapshot', () => {
    const actualConfig = DEFAULT_CONFIG;

    expect(actualConfig).toMatchSnapshot();
  });
});
