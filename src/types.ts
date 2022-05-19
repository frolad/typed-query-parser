import {
  QueryValueType,
  ParserSettings,
  ValidateSettings,
  isArrayOptionsPreset,
  ArraySeparatorOptions,
} from './model';

export interface LiteralValueType<T extends string | number | undefined> extends QueryValueType<T> {
  readonly literals: T[];
}

export interface ArrayValueType<E extends string | number, T extends E[] | undefined>
  extends QueryValueType<T> {
  readonly element: QueryValueType<T>;
}

export class Boolean implements QueryValueType<true | undefined> {
  readonly defaultValue: true | undefined;

  validate(val: string[], settings?: ParserSettings) {
    if (val.length > 1 && settings?.shouldThrow) {
      throw new Error('Expected boolean but got array');
    }

    return val.length !== 0 ? true : this.defaultValue;
  }

  static stringify(val: true) {
    return val ? '' : false;
  }
}

export function boolean(): QueryValueType<true | undefined> {
  return new Boolean();
}

export class Number implements QueryValueType<number | undefined> {
  readonly defaultValue: number | undefined;

  constructor(defaultValue?: number) {
    this.defaultValue = defaultValue;
  }

  validate(val: string[], settings?: ParserSettings) {
    if (val.length > 1 && settings?.shouldThrow) {
      throw new Error('Expected number but got array');
    }

    if (val[0]) {
      if (/^-?\d+\.?\d*$/.test(val[0])) {
        return +val[0];
      } else {
        if (settings?.shouldThrow) {
          throw new Error(`Expected number but got "${val[0]}"`);
        }

        return this.defaultValue;
      }
    }

    return this.defaultValue;
  }

  static stringify(val: number) {
    return typeof val === 'number' ? val.toString() : false;
  }
}

export function number(): QueryValueType<number | undefined>;
export function number(defaultValue: number): QueryValueType<number>;
export function number(
  defaultValue?: number
): QueryValueType<number> | QueryValueType<number | undefined> {
  return new Number(defaultValue);
}

export class String implements QueryValueType<string | undefined> {
  readonly defaultValue: string | undefined;

  constructor(defaultValue?: string) {
    this.defaultValue = defaultValue;
  }

  validate(val: string[], settings?: ParserSettings) {
    if (val.length > 1 && settings?.shouldThrow) {
      throw new Error('Expected string but got array');
    }

    return val.length !== 0 ? val[0] : this.defaultValue;
  }

  static stringify(val: string) {
    return typeof val === 'string' ? val : false;
  }
}

export function string(): QueryValueType<string | undefined>;
export function string(defaultValue: string): QueryValueType<string>;
export function string(
  defaultValue?: string
): QueryValueType<string> | QueryValueType<string | undefined> {
  return new String(defaultValue);
}

export class Literal<T extends string | number> implements LiteralValueType<T | undefined> {
  readonly literals: T[];
  readonly defaultValue: T | undefined;

  constructor(literals: T[], defaultValue?: T) {
    this.defaultValue = defaultValue;
    this.literals = literals;
  }

  validate(val: string[], settings?: ParserSettings) {
    if (val.length > 1 && settings?.shouldThrow) {
      throw new Error('Expected literal but got array');
    }

    if (val[0]) {
      const literal = this.literals.find(literal =>
        typeof literal === 'number' && val[0] ? literal === parseInt(val[0]) : literal === val[0]
      );
      if (literal) {
        return literal;
      } else if (settings?.shouldThrow) {
        throw new Error(`Expected literal one of [${this.literals.join(',')}] but got ${val[0]}`);
      }
    }

    return this.defaultValue;
  }

  static stringify(val: string | number) {
    return typeof val === 'string' ? val : typeof val === 'number' ? val.toString() : false;
  }
}

export function literal<T extends string | number>(...literals: T[]) {
  function createLiteral(): LiteralValueType<T | undefined>;
  function createLiteral(defaultValue: T): LiteralValueType<T>;
  function createLiteral(defaultValue?: T): LiteralValueType<T | undefined> | LiteralValueType<T> {
    return new Literal(literals, defaultValue);
  }

  return createLiteral;
}

export class QueryArray<E extends QueryValueType>
  implements
    ArrayValueType<NonNullable<E['defaultValue']>, NonNullable<E['defaultValue']>[] | undefined>
{
  readonly defaultValue: E['defaultValue'][] | undefined;
  readonly element: QueryValueType<E['defaultValue']>;

  constructor(element: QueryValueType<E>, defaultValue?: E['defaultValue'][]) {
    this.defaultValue = defaultValue;
    this.element = element;
  }

  validate(val: string[], settings?: ValidateSettings) {
    if (val) {
      const elems: E['defaultValue'][] = [];

      let list: string[] = [];
      if (!settings || !isArrayOptionsPreset(settings)) {
        if (val.length > 1 && settings?.shouldThrow) {
          throw new Error(
            `Array separator is "${settings.array_separator}" set but query contains more than one key:value pair`
          );
        }

        if (val[0]) {
          list = val[0].split(settings?.array_separator || ',');
        }
      } else {
        list = val;
      }

      list.forEach(elem => {
        const val = this.element.validate([elem], settings);
        if (typeof val !== 'undefined') {
          elems.push(val);
        }
      });

      return elems.length ? elems : this.defaultValue;
    }

    return this.defaultValue;
  }

  static stringify(val: Array<string | number>, options: ArraySeparatorOptions) {
    if (!isArrayOptionsPreset(options)) {
      return val.join(options.array_separator);
    }

    return val;
  }
}

export function array<E extends QueryValueType>(element: E) {
  function createArray(): ArrayValueType<
    NonNullable<E['defaultValue']>,
    NonNullable<E['defaultValue']>[] | undefined
  >;
  function createArray(
    defaultValue: Array<NonNullable<E['defaultValue']>>
  ): ArrayValueType<NonNullable<E['defaultValue']>, NonNullable<E['defaultValue']>[]>;
  function createArray(
    defaultValue?: Array<E['defaultValue']>
  ):
    | ArrayValueType<NonNullable<E['defaultValue']>, NonNullable<E['defaultValue']>[] | undefined>
    | ArrayValueType<NonNullable<E['defaultValue']>, NonNullable<E['defaultValue']>[]> {
    return new QueryArray(element, defaultValue);
  }

  return createArray;
}

export function isQueryArray(item: QueryArray<any> | QueryValueType): item is QueryArray<any> {
  return (item as QueryArray<any>).element !== undefined;
}
