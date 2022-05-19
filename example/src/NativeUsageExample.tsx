import {Button, Alert} from 'react-bootstrap';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {vs2015} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import {useEffect, useState} from 'react';
// pay attention to the usage of these methods
import {CreateSchema, ParseQuery, StringifyOn, Static} from 'typed-query-parser';

// first you created schema for your query
const Schema = CreateSchema(({string, number, literal}) => ({
  username: string(),
  age: number(),
  foo: literal('bar', 'baz')('bar'),
}));

// then you can get TS type for later use
type Params = Static<typeof Schema>;

export default function NativeUsageComponent() {
  // state only for demo, pay atation to "parseParams" and "setParams" functions
  const [parsedQuery, setParsedQuery] = useState<Params>(
    ParseQuery(window.location.search, Schema)
  );

  function parseParams() {
    setParsedQuery(ParseQuery(window.location.search, Schema));
  }

  function setParams() {
    const username = prompt('Username', 'Harry Potter');
    const age = prompt('age');
    if (!age || !/^-?\d+\.?\d*$/.test(age)) {
      return alert('Not real age, use number');
    }
    const foo = prompt('foo', 'bar');
    if (foo !== 'bar' && foo !== 'baz') {
      return alert('Foo bar baz');
    }

    const newQueryString = StringifyOn(window.location.search, {
      username: username || undefined,
      age: age || undefined,
      foo: foo || 'bar',
    });

    window.history.pushState(null, '', `${window.location.pathname}?${newQueryString}`);
    parseParams();
  }

  useEffect(() => {
    parseParams();
  }, []);

  // render is not important and done only for demo purpuses and iteractivity
  return (
    <>
      <Alert variant="secondary">
        <Alert.Heading as="h6">Schema:</Alert.Heading>
        <small>
          <SyntaxHighlighter language="javascript" style={vs2015}>
            {`const Schema = CreateSchema(({string, number, literal, array}) => ({\n  username: string(),\n  total_clicks: number(0),\n  foo: literal('bar', 'baz')('bar'),\n}));`}
          </SyntaxHighlighter>
        </small>
      </Alert>
      <Alert variant="success">
        <Alert.Heading as="h6">Query string:</Alert.Heading>
        <small>
          <pre className="mb-0 bg-dark text-light p-1">{window.location.search || 'empty'}</pre>
        </small>
        <br />
        <Alert.Heading as="h6">Parsed query string:</Alert.Heading>
        <small>
          <SyntaxHighlighter language="json" style={vs2015}>
            {JSON.stringify(parsedQuery || {}, (k, v) => (v === undefined ? '(undefined)' : v), 2)}
          </SyntaxHighlighter>
        </small>
      </Alert>
      <Button variant="primary" onClick={setParams}>
        Set params
      </Button>
    </>
  );
}
