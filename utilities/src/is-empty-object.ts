export function isEmptyObject(input: NonNullable<object>): input is {} {
  return Object.keys(input).length === 0;
}
