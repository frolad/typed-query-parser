import {QueryValueType, ParserSettings, ValidateSettings} from './model';
import {boolean, string, number, literal, array, isQueryArray} from './types';

export type SchemaTypes = {
  boolean: typeof boolean;
  string: typeof string;
  number: typeof number;
  literal: typeof literal;
  array: typeof array;
};

export function CreateSchema<O extends {[_: string]: QueryValueType}>(
  builder: (types: SchemaTypes) => O
) {
  return builder({
    boolean,
    string,
    number,
    literal,
    array,
  });
}

export function ParseQuery<O extends {[_: string]: QueryValueType}>(
  queryString: string,
  schema: O,
  settings?: ParserSettings
): {
  [K in keyof O]: O[K]['defaultValue'];
};

export function ParseQuery<O extends {[_: string]: QueryValueType}>(
  queryString: string,
  builder: (types: SchemaTypes) => O,
  settings?: ParserSettings
): {
  [K in keyof O]: O[K]['defaultValue'];
};

export function ParseQuery<O extends {[_: string]: QueryValueType}>(
  queryString: string,
  second: (types: SchemaTypes) => O | O,
  settings?: ParserSettings
) {
  const query = new URLSearchParams(queryString);
  const schema = typeof second === 'function' ? CreateSchema(second) : second;

  const res: {
    [K in keyof O]?: O[K]['defaultValue'];
  } = {};

  let validateSettings: ValidateSettings;

  if (settings) {
    if ('array_preset' in settings && settings.array_preset) {
      validateSettings = {
        ...settings,
        array_preset: settings.array_preset,
      };
    } else if ('array_separator' in settings && settings.array_separator) {
      validateSettings = {
        ...settings,
        array_separator: settings.array_separator,
      };
    } else {
      validateSettings = {
        ...settings,
        array_separator: ',',
      };
    }
  } else {
    validateSettings = {array_separator: ','};
  }

  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      const elem = schema[key];
      if (!elem) {
        continue;
      }

      let queryKey: string = key;
      if (settings && isQueryArray(elem)) {
        if ('array_preset' in settings) {
          queryKey = settings.array_preset === 'elements[]' ? `${queryKey}[]` : queryKey;
        }
      }
      try {
        res[key] = elem.validate(query.getAll(queryKey), validateSettings);
      } catch (error) {
        if (settings?.shouldThrow) {
          throw new Error(`${key}: ${error}`);
        }
      }
    }
  }

  return res as {[K in keyof O]: O[K]['defaultValue']};
}
