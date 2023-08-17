export function toBool(value: unknown, _default?: boolean | undefined) {
  if (typeof value === undefined || value === undefined) {
    if (typeof _default === undefined || _default === undefined) {
      return false;
    } else {
      value = _default;
    }
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    let stringVal: string = value;

    stringVal = stringVal.trim();
    stringVal = stringVal.toLowerCase();

    return ["true", "1"].indexOf(stringVal) >= 0;
  }

  if (typeof value === "number") {
    return value > 0 || value < 0;
  }
}
