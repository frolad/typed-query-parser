<p align="center">
  <img src="typed-query-parser.png" />
</p>

[![Build Size](https://img.shields.io/bundlephobia/minzip/typed-query-parser?label=bundle%20size&style=flat&colorA=434c55&colorB=24292f)](https://bundlephobia.com/package/typed-query-parser@1.0.0)
[![Version](https://img.shields.io/npm/v/typed-query-parser?style=flat&colorA=434c55&colorB=24292f)](https://www.npmjs.com/package/typed-query-parser)
[![Build Status](https://github.com/frolad/typed-query-parser/actions/workflows/test-and-lint.yml/badge.svg)](https://github.com/frolad/typed-query-parser/actions/workflows/test-and-lint.yml)

Fast and light type-guarded query string parsers (handy hook for react included) with ability to set default value.

```bash
npm install typed-query-parser
```

## Define, parse and set

```ts
import {CreateSchema, ParseQuery, StringifyOn} from 'typed-query-parser'

let queryString = "?q=foo&limited" // e.g. window.location.search

// define
const TableSchema = CreateSchema(({boolean, string, number, array, literal}) => ({
    q: string(),
    page_id: number(1),
    order_by: literal("id", "title")("id"),
    order_dir: literal("asc","desc")("desc"),
    selected: array(number())(),
    limited: boolean(),
}))

// parse
const TableParams = ParseQuery(queryString, TableSchema)
/* TableParams - {
    q: "foo",
    page_id: 1,
    order_by: "id",
    order_dir: "desc",
    selected: undefined,
    limited: true,
}*/

// set
queryString = StringifyOn(queryString, {...TableParams, q: "bar"})
```

## Data types
Currently only 5 data types is available: `boolean`, `string`, `number`, `array`, `literal`

All of them expect `boolean` supports optional default value as the first parameter, so if `key` is not present in the query string then value fallbacks into default;

```ts
const Schema = CreateSchema(({string}) => ({
    foo: string(),
    bar: string("baz"),
}))

// parsing on empty query string
const Data = ParseQuery("", Schema) // foo = undefined, bar = baz

// parsing on non-empty query string
const Data = ParseQuery("?foo=qux", Schema) // foo = qux, bar = baz
```

### boolean
apart from any other types boolean doesn't have default value and becomes true only if their `key` is present

### number
any positive or negative number including float, fallbacks into `default` if value is not number or not present

### string
any string, fallbacks into `default` if not present

### array
array of types e.g. `array(string())()`, fallbacks into `default` if not present or if there is no elements which passes type validation of the element

### literal
predefined list of numbers or strings, fallbacks into `default` if not present or if value is not one of literals

## Methods
### CreateSchema

Create schema for query string, reciaves function which must return object of key:value, where value is type

```ts
const Schema = CreateSchema(types => ({
    foo: types.number(),
    bar: types.string(),
}))
```

### ParseQuery

Parse query string with schema, can pass precreated schema or pass schema-builder function
```ts
const queryString = window.location.search;

const TableParams = ParseQuery(queryString, Schema)
// OR
const TableParams = ParseQuery(queryString, types => ({
    foo: types.number(),
    bar: types.string(),
}))
```

Supports third optional parameter with parser settings

```ts
const TableParams = ParseQuery(queryString, Schema, {
    shouldThrow: true,
    array_separator: ",",
})
```

`shouldThrow`
> throw Error when validation of any type fails, you can catch is with `try catch`

`array_separator`
> specify separator for array values if you pass array with single key, default is comma

example query string:
```url
?foo=bar,baz
```

`array_preset`
> specify preset for the array values from `elements` | `elements[]` if you pass array with multiple keys 

example query string for `elements`:
```url
?foo=bar&foo=baz
```

example query string for `elements[]`:
```url
?foo[]=bar&foo[]=baz
```

**can't specify both  `array_separator` and `array_preset`**

### Stringify

Stringify query object back to query string

```ts
const queryObject = {
    foo: "bar",
    baz: 1,
}

const queryString = Stringify(queryObject)
// foo=bar&baz=1
```

### StringifyOn

Stringify query object back to query string using existed query string

```ts
let queryString = "foo=qux&baz=1"

const queryObject = {
    foo: "bar",
    baz: undefined,
}

queryString = StringifyOn(queryString, queryObject)
// foo=bar
```

> if value of `key` is undefined then this key will be removed fromt the query string

### React hook

Hook for react functions with ability to update URL automatically

```ts
import {CreateSchema, useQueryParser} from 'typed-query-parser'

const Schema = CreateSchema(({string}) => ({
    foo: string(),
    bar: string(),
}))

// simple usage
function ReactComponentSimple() {
    const [ parsedQuery, updateQuery ] = useQueryParser(window.location.search, Schema);
    
    //...

    function setFoo() {
        const updatedQueryString = updateQuery({foo: "baz"})
        // returns modified query string (window.location.search) with new "foo" value
    }

    function clearBar() {
        const updatedQueryString = updateQuery({bar: undefined})
        // returns modified query string (window.location.search) with "bar" removed
    }

}

// with automatic url update
function ReactComponent() {
    const [ parsedQuery, updateQuery ] = useQueryParser(
        window.location.search,
        Schema,
        {onUpdateAction: "push"}
    );
    
    //...

    function setFoo() {
        updateQuery({foo: "baz"})
        // set "foo" to query URL, triggers rerender
    }

    function clearBar() {
        const updatedQueryString = updateQuery({bar: undefined})
        // remove "bar" frm query URL, triggers rerender
    }

    // updateQuery still returns updated query string if you need it
}
```

> onUpdateAction can be `push` which triggers `pushSate` or `replace` which triggers `replaceState`

> as well if you don't want hook to update URL automatically but still want to do it with updateQuery function, you can pass `push` OR `replace` as the second parameter to `updateQuery` 

you can pass `array_separator` OR `array_preset` to the third parameter as well to specify how hook should parse arrays


### Typescript

Package is fully typed and mostly you don't need any special type of it, all tho you may want to get Typescript type of Schema to be able to use it as props etc. To do so use exported type `Static`

```ts
import {CreateSchema, Static} from 'typed-query-parser'

const Schema = CreateSchema(({string}) => ({
    foo: string(),
    bar: string("baz"),
}))

type SchemaType = Static<typeof Schema>
```

## Examples

you can find example of usage in [NativeUsageExample.tsx](https://github.com/frolad/typed-query-parser/blob/main/example/src/NativeUsageExample.tsx)

and react hook example of usage in [ReactUsageExample.tsx](https://github.com/frolad/typed-query-parser/blob/main/example/src/ReactUsageExample.tsx)

## References

- This packages inspired by an amazing [runtypes](https://github.com/pelotom/runtypes) runtime validation for static types
- Since it's my first public npm package I used [zusand](https://github.com/pmndrs/zustand) as an example for settings up all needed configs an so on. Zusand is an amazing state managemer <3
