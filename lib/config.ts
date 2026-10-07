export const isTestToolsEnabled = (): boolean => {
  return process.env.EXPO_PUBLIC_SHOW_TEST_TOOLS === 'true';
};
