import DecodeUriComponent from 'decode-uri-component';
import {ArraySeparatorOptions, ArrayPreset} from './model';
import {Boolean, String, Number, QueryArray} from './types';

export type QueryData = {
  [key: string]: string | number | true | undefined | Array<string | number>;
};

export type QuerySettings = Partial<ArraySeparatorOptions> & {decode?: boolean};

export function Stringify(data: QueryData, settings?: QuerySettings): string {
  return StringifyOn('', data, settings);
}

export function StringifyOn(
  on: string,
  data?: QueryData,
  settings?: Partial<QuerySettings>
): string {
  const query = new URLSearchParams(on);

  let arrayOptions: ArraySeparatorOptions;

  if (settings && 'array_preset' in settings && settings.array_preset) {
    arrayOptions = {
      array_preset: settings.array_preset,
    };
  } else if (settings && 'array_separator' in settings && settings.array_separator) {
    arrayOptions = {
      array_separator: settings.array_separator,
    };
  } else {
    arrayOptions = {array_separator: ','};
  }

  if (data) {
    Object.entries(data).forEach(([key, val]) => {
      let value: string | false = false;
      switch (typeof val) {
        case 'boolean':
          value = Boolean.stringify(val);
          break;
        case 'number':
          value = Number.stringify(val);
          break;
        case 'string':
          value = String.stringify(val);
          break;
      }

      if (Array.isArray(val) && val.length > 0) {
        const value = QueryArray.stringify(val, arrayOptions);
        if (Array.isArray(value)) {
          let preset: ArrayPreset = 'elements';
          if ('array_preset' in arrayOptions) {
            preset = arrayOptions.array_preset;
          }

          query.delete(key);
          value.forEach(val => {
            query.append(
              preset === 'elements' ? key : `${key}[]`,
              typeof val === 'string' ? val : val.toString()
            );
          });
        } else {
          query.set(key, value);
        }
        //value = QueryArray.valToString(val);
      } else if (value !== false) {
        query.set(key, value);
      } else {
        query.delete(key);
      }
    });
  }

  return `${on.length > 0 && on[0] === '?' ? '?' : ''}${
    settings?.decode ? DecodeUriComponent(query.toString()) : query.toString()
  }`;
}
