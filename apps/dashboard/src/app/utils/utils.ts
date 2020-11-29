/**
 * Convert an object array into a json object, with keys corresponding to array entries
 * @param keyfield any unique field which all array objects contain to use as hash keys (e.g. 'id')
 */
export function arrayToHashmap<T>(arr: T[], keyfield: string) {
  const hashmap: { [key: string]: T } = {};
  for (const el of arr) {
    if (el.hasOwnProperty(keyfield)) {
      hashmap[el[keyfield]] = el;
    }
  }
  return hashmap;
}

/**
 * Create a subset of a json object depending on key or value filter functions
 */
export function objectFilter(
  json: any,
  keyFilter: (key: string) => boolean = () => true,
  valueFilter: (value: any) => boolean = () => true
) {
  const meta = {};
  Object.entries(json)
    .filter(([key]) => keyFilter(key))
    .filter(([_, value]) => valueFilter(value))
    .forEach(([key, value]) => (meta[key] = value));
  return meta;
}
