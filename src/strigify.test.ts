import {StringifyOn, Stringify} from './stringify';

describe('Test query stringifyer', () => {
  it('build from empty', () => {
    expect(
      Stringify({foo: 1, bar: '%2', baz: true, qux: ['a', 'b'], quux: [1, 2]}, {decode: true})
    ).toBe('foo=1&bar=%2&baz=&qux=a,b&quux=1,2');
  });

  it('replace existed', () => {
    expect(
      StringifyOn(
        'foo=2&baz=&qux=a,b&quux=3,4',
        {
          foo: 1,
          bar: '2',
          baz: true,
          qux: ['a', 'b'],
          quux: [1, 2],
        },
        {decode: true}
      )
    ).toBe('foo=1&baz=&qux=a,b&quux=1,2&bar=2');

    expect(
      StringifyOn('?foo=2', {
        foo: 1,
      })
    ).toBe('?foo=1');
  });

  it('remove existed', () => {
    expect(
      StringifyOn('foo=2&qux=a,b', {
        foo: 1,
        qux: undefined,
      })
    ).toBe('foo=1');
  });

  it('array separators and presets', () => {
    expect(Stringify({foo: ['bar', 'baz']}, {decode: true})).toBe('foo=bar,baz');

    expect(Stringify({foo: ['bar', 'baz']}, {array_preset: 'elements', decode: true})).toBe(
      'foo=bar&foo=baz'
    );

    expect(Stringify({foo: ['bar', 'baz']}, {array_preset: 'elements[]'})).toBe(
      'foo%5B%5D=bar&foo%5B%5D=baz'
    );

    expect(Stringify({foo: ['bar', 'baz']}, {array_separator: ':', decode: true})).toBe(
      'foo=bar:baz'
    );
  });
});
