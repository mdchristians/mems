import isNil from "lodash/isnil";

type UnknownObject = {
  [key: string]: string | number | undefined;
};

type CallbackFn = (...args: any[]) => any;

export function tagExtractor(obj: UnknownObject, keys: string[], transformer?: CallbackFn) {
  for (let i = 0; i < keys.length; i++) {
    if (!isNil(obj[keys[i]])) {
      if (typeof transformer === "function") {
        return transformer(obj[keys[i]]);
      }

      return obj[keys[i]];
    }
  }

  return null;
}
