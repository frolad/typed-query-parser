import {CreateSchema, ParseQuery} from './parser';

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

describe('Test query parser', () => {
  it('boolean', () => {
    let res = ParseQuery('', Schema);
    expect(res.foo_bool).toBeUndefined();

    res = ParseQuery('?foo_bool', Schema);
    expect(res.foo_bool).toBe(true);

    res = ParseQuery('?foo_bool=bar', Schema);
    expect(res.foo_bool).toBe(true);
  });

  it('number', () => {
    let res = ParseQuery('', Schema);
    expect(res.foo_num).toBe(1);
    expect(res.foo_num_nd).toBeUndefined();

    res = ParseQuery('?foo_num', Schema);
    expect(res.foo_num).toBe(1);
    expect(res.foo_num_nd).toBeUndefined();

    res = ParseQuery('?foo_num=2&foo_num_nd', Schema);
    expect(res.foo_num).toBe(2);
    expect(res.foo_num_nd).toBeUndefined();

    res = ParseQuery('?foo_num_nd=2', Schema);
    expect(res.foo_num).toBe(1);
    expect(res.foo_num_nd).toBe(2);

    res = ParseQuery('?foo_num=2a&foo_num_nd=1.24', Schema);
    expect(res.foo_num).toBe(1);
    expect(res.foo_num_nd).toBe(1.24);

    res = ParseQuery('?foo_num=-5&foo_num_nd=0.05', Schema);
    expect(res.foo_num).toBe(-5);
    expect(res.foo_num_nd).toBe(0.05);
  });

  it('string', () => {
    let res = ParseQuery('', Schema);
    expect(res.foo_str).toBe('bar');
    expect(res.foo_str_nd).toBeUndefined();

    res = ParseQuery('?foo_str', Schema);
    expect(res.foo_str).toBe('');
    expect(res.foo_str_nd).toBeUndefined();

    res = ParseQuery('?foo_str=%25baz&foo_str_nd', Schema);
    expect(res.foo_str).toBe('%baz');
    expect(res.foo_str_nd).toBe('');

    res = ParseQuery('?foo_str=5&foo_str_nd=%25baz%25', Schema);
    expect(res.foo_str).toBe('5');
    expect(res.foo_str_nd).toBe('%baz%');

    res = ParseQuery('?foo_str=6,7,8&foo_str_nd=[test]', Schema);
    expect(res.foo_str).toBe('6,7,8');
    expect(res.foo_str_nd).toBe('[test]');
  });

  it('literal', () => {
    let res = ParseQuery('', Schema);
    expect(res.foo_lit).toBe('bar');
    expect(res.foo_lit_num).toBeUndefined();
    expect(res.foo_lit_nd).toBeUndefined();

    res = ParseQuery('?foo_lit', Schema);
    expect(res.foo_lit).toBe('bar');
    expect(res.foo_lit_num).toBeUndefined;
    expect(res.foo_lit_nd).toBeUndefined();

    res = ParseQuery('?foo_lit=baz&foo_lit_nd', Schema);
    expect(res.foo_lit).toBe('baz');
    expect(res.foo_lit_num).toBeUndefined;
    expect(res.foo_lit_nd).toBeUndefined();

    res = ParseQuery('?foo_lit_num=1&foo_lit_nd=baz', Schema);
    expect(res.foo_lit).toBe('bar');
    expect(res.foo_lit_num).toBe(1);
    expect(res.foo_lit_nd).toBe('baz');

    res = ParseQuery('?foo_lit=quux&foo_lit_num=quux&foo_lit_nd=quux', Schema);
    expect(res.foo_lit).toBe('bar');
    expect(res.foo_lit_num).toBeUndefined();
    expect(res.foo_lit_nd).toBeUndefined();

    res = ParseQuery('?foo_lit=baz,qux&foo_lit_num=5a&foo_lit_nd=[qux]', Schema);
    expect(res.foo_lit).toBe('bar');
    expect(res.foo_lit_num).toBeUndefined();
    expect(res.foo_lit_nd).toBeUndefined();
  });

  it('array', () => {
    let res = ParseQuery('', Schema);
    expect(res.foo_arr_str).toEqual(['bar']);
    expect(res.foo_arr_str_nd).toBeUndefined();
    expect(res.foo_arr_num).toEqual([1]);
    expect(res.foo_arr_lit).toEqual(['bar', 'baz']);
    expect(res.foo_arr_lit_nd).toBeUndefined();

    res = ParseQuery(
      '?foo_arr_str=baz,qux&foo_arr_num=2&foo_arr_lit=bar,qux&foo_arr_lit_nd=baz',
      Schema
    );
    expect(res.foo_arr_str).toEqual(['baz', 'qux']);
    expect(res.foo_arr_str_nd).toBeUndefined();
    expect(res.foo_arr_num).toEqual([2]);
    expect(res.foo_arr_lit).toEqual(['bar', 'qux']);
    expect(res.foo_arr_lit_nd).toEqual(['baz']);

    res = ParseQuery('?foo_arr_str=1&foo_arr_num=5a&foo_arr_lit=quux&foo_arr_lit_nd=quux', Schema);
    expect(res.foo_arr_str).toEqual(['1']);
    expect(res.foo_arr_str_nd).toBeUndefined();
    expect(res.foo_arr_num).toEqual([1]);
    expect(res.foo_arr_lit).toEqual(['bar', 'baz']);
    expect(res.foo_arr_lit_nd).toBeUndefined();

    res = ParseQuery('?foo_arr_str=baz&foo_arr_str=bar&foo_arr_num=2&foo_arr_num=3', Schema);
    expect(res.foo_arr_str).toEqual(['baz']);
    expect(res.foo_arr_str_nd).toBeUndefined();
    expect(res.foo_arr_num).toEqual([2]);
    expect(res.foo_arr_lit).toEqual(['bar', 'baz']);
    expect(res.foo_arr_lit_nd).toBeUndefined();
  });

  it('array separators', () => {
    let res = ParseQuery('?foo_arr_str=baz,bar', Schema);
    expect(res.foo_arr_str).toEqual(['baz', 'bar']);

    res = ParseQuery('?foo_arr_str=baz:bar', Schema, {array_separator: ':'});
    expect(res.foo_arr_str).toEqual(['baz', 'bar']);

    res = ParseQuery('?foo_arr_str=baz&foo_arr_str=bar', Schema, {array_preset: 'elements'});
    expect(res.foo_arr_str).toEqual(['baz', 'bar']);

    res = ParseQuery('?foo_arr_str[]=baz&foo_arr_str[]=bar', Schema, {array_preset: 'elements[]'});
    expect(res.foo_arr_str).toEqual(['baz', 'bar']);

    expect(() => {
      ParseQuery('?foo_arr_str=baz&foo_arr_str=bar', Schema, {shouldThrow: true});
    }).toThrow(
      'foo_arr_str: Error: Array separator is "," set but query contains more than one key:value pair'
    );
  });
});
