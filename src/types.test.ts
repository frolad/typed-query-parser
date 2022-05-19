import {CreateSchema} from './parser';
import {Boolean, String, Number, Literal, QueryArray} from './types';

const Schema = CreateSchema(({string, number, array, literal, boolean}) => ({
  foo_bool: boolean(),
  foo_str: string('bar'),
  foo_str_nd: string(),
  foo_num: number(1),
  foo_num_nd: number(),
  foo_lit: literal('bar', 'baz', 'qux')('bar'),
  foo_lit_num: literal(1, 2, 3)(),
  foo_lit_nd: literal('bar', 'baz', 'qux')(),
  foo_arr_str: array(string())(['bar']),
  foo_arr_str_nd: array(string())(),
  foo_arr_num: array(number())([1]),
  foo_arr_lit: array(literal('bar', 'baz', 'qux')())(['bar', 'baz']),
  foo_arr_lit_nd: array(literal('bar', 'baz', 'qux')())(),
}));

describe('Test schema builder', () => {
  it('boolean', () => {
    expect(Schema.foo_bool.defaultValue).toBeUndefined();
    expect(Schema.foo_bool.validate([''])).toBe(true);
    expect(Schema.foo_bool.validate(['bar'])).toBe(true);
    expect(Schema.foo_bool.validate([])).toBeUndefined();
    expect(Schema.foo_bool.validate(['bar', 'baz'])).toBe(true);
    expect(() => {
      Schema.foo_bool.validate(['bar', 'baz'], {shouldThrow: true, array_separator: ','});
    }).toThrow('Expected boolean but got array');

    expect(Boolean.stringify(true)).toBe('');
  });

  it('number', () => {
    expect(Schema.foo_num.defaultValue).toBe(1);
    expect(Schema.foo_num_nd.defaultValue).toBeUndefined();
    expect(Schema.foo_num_nd.validate(['1'])).toBe(1);
    expect(Schema.foo_num_nd.validate(['1.25'])).toBe(1.25);
    expect(Schema.foo_num_nd.validate(['5a'])).toBeUndefined();
    expect(Schema.foo_num_nd.validate([])).toBeUndefined();
    expect(Schema.foo_num.validate(['2', '3'])).toBe(2);
    expect(Schema.foo_num_nd.validate(['2', '3'])).toBe(2);
    expect(() => {
      Schema.foo_num.validate(['1', '2'], {shouldThrow: true, array_separator: ','});
    }).toThrow(`Expected number but got array`);
    expect(() => {
      Schema.foo_num.validate(['5a'], {shouldThrow: true, array_separator: ','});
    }).toThrow(`Expected number but got "5a"`);

    expect(Number.stringify(1)).toBe('1');
    expect(Number.stringify(1.25)).toBe('1.25');
  });

  it('string', () => {
    expect(Schema.foo_str.defaultValue).toBe('bar');
    expect(Schema.foo_str_nd.defaultValue).toBeUndefined();
    expect(Schema.foo_str_nd.validate([''])).toBe('');
    expect(Schema.foo_str_nd.validate(['bar'])).toBe('bar');
    expect(Schema.foo_str_nd.validate([])).toBeUndefined();
    expect(Schema.foo_str.validate(['bar', 'baz'])).toBe('bar');
    expect(Schema.foo_str_nd.validate(['bar', 'baz'])).toBe('bar');
    expect(() => {
      Schema.foo_str.validate(['1', '2'], {shouldThrow: true, array_separator: ','});
    }).toThrow(`Expected string but got array`);

    expect(String.stringify('bar')).toBe('bar');
  });

  it('literal', () => {
    expect(Schema.foo_lit.defaultValue).toBe('bar');
    expect(Schema.foo_lit_nd.defaultValue).toBeUndefined();
    expect(Schema.foo_lit_nd.validate(['bar'])).toBe('bar');
    expect(Schema.foo_lit_nd.validate(['quux'])).toBeUndefined();
    expect(Schema.foo_lit_num.validate(['1'])).toBe(1);
    expect(Schema.foo_lit_num.validate(['4'])).toBeUndefined();
    expect(Schema.foo_lit_nd.validate([])).toBeUndefined();
    expect(Schema.foo_lit.validate(['baz', 'qux'])).toBe('baz');
    expect(Schema.foo_lit_nd.validate(['baz', 'qux'])).toBe('baz');
    expect(() => {
      Schema.foo_lit.validate(['baz', 'qux'], {shouldThrow: true, array_separator: ','});
    }).toThrow(`Expected literal but got array`);
    expect(() => {
      Schema.foo_lit.validate(['quux'], {shouldThrow: true, array_separator: ','});
    }).toThrow(`Expected literal one of [bar,baz,qux] but got quux`);
    expect(() => {
      Schema.foo_lit_num.validate(['4'], {shouldThrow: true, array_separator: ','});
    }).toThrow(`Expected literal one of [1,2,3] but got 4`);

    expect(Literal.stringify('bar')).toBe('bar');
    expect(Literal.stringify(1)).toBe('1');
  });

  it('array', () => {
    expect(Schema.foo_arr_str.defaultValue).toEqual(['bar']);
    expect(Schema.foo_arr_str_nd.defaultValue).toBeUndefined();
    expect(Schema.foo_arr_num.defaultValue).toEqual([1]);
    expect(Schema.foo_arr_lit.defaultValue).toEqual(['bar', 'baz']);
    expect(Schema.foo_arr_str.validate(['bar,baz'])).toEqual(['bar', 'baz']);
    expect(Schema.foo_arr_str.validate([])).toEqual(['bar']);
    expect(Schema.foo_arr_str_nd.validate([])).toBeUndefined();
    expect(Schema.foo_arr_num.validate(['2,3'])).toEqual([2, 3]);
    expect(Schema.foo_arr_num.validate(['5a'])).toEqual([1]);
    expect(Schema.foo_arr_num.validate([])).toEqual([1]);
    expect(Schema.foo_arr_lit.validate(['baz,qux'])).toEqual(['baz', 'qux']);
    expect(Schema.foo_arr_lit.validate(['baz,quux'])).toEqual(['baz']);
    expect(Schema.foo_arr_lit.validate(['quux'])).toEqual(['bar', 'baz']);
    expect(Schema.foo_arr_lit.validate([])).toEqual(['bar', 'baz']);
    expect(() => {
      Schema.foo_arr_lit.validate(['bar', 'baz'], {shouldThrow: true, array_separator: ','});
    }).toThrow('Array separator is "," set but query contains more than one key:value pair');
    expect(() => {
      Schema.foo_arr_num.validate(['5a'], {shouldThrow: true, array_separator: ','});
    }).toThrow('Expected number but got "5a"');

    expect(QueryArray.stringify(['bar', 'baz'], {array_separator: ','})).toBe('bar,baz');
    expect(QueryArray.stringify([1, 2], {array_separator: ':'})).toBe('1:2');
    expect(QueryArray.stringify(['baz', 'qux'], {array_preset: 'elements'})).toEqual([
      'baz',
      'qux',
    ]);
  });
});
