export type ArrayPreset = 'elements' | 'elements[]';

export type ArrayOptionsSeparator = {
  array_separator: string;
};

export type ArrayOptionsPreset = {
  array_preset: ArrayPreset;
};

export type ArraySeparatorOptions = ArrayOptionsSeparator | ArrayOptionsPreset;

export type ValidateSettings = ArraySeparatorOptions & {shouldThrow?: true};

export type ParserSettings = (Partial<ArrayOptionsSeparator> | Partial<ArrayOptionsPreset>) & {
  shouldThrow?: true;
};

export interface QueryValueType<T = any> {
  readonly defaultValue: T;
  validate: (val: string[], settings?: ValidateSettings) => T | undefined;
}

export function isArrayOptionsPreset(
  item: ArrayOptionsSeparator | ArrayOptionsPreset
): item is ArrayOptionsPreset {
  return (item as ArrayOptionsPreset).array_preset !== undefined;
}

export type Static<O extends {[_: string]: QueryValueType}> = {
  [K in keyof O]: O[K]['defaultValue'];
};
