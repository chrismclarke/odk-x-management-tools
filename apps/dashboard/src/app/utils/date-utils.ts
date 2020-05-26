/**
 * Create suffix in format yyyy-mm-dd (according to locale time)
 */
export const dateSuffix = () => {
  return new Date()
    .toLocaleDateString()
    .split('/')
    .reverse()
    .join('-');
};
