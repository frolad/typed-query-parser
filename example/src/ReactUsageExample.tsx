import {Form, Card, Alert, Table} from 'react-bootstrap';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {vs2015} from 'react-syntax-highlighter/dist/esm/styles/hljs';
// pay attention to the usage of these methods
import {CreateSchema, useQueryParser} from 'typed-query-parser';

// first you created schema for your query
const Schema = CreateSchema(({number, literal, array}) => ({
  order_by: literal('id', 'title')(),
  order_dir: literal('asc', 'desc')('desc'),
  selected_ids: array(number())(),
}));

const tableData = [
  {
    id: 1,
    title: 'first',
  },
  {
    id: 2,
    title: 'second',
  },
  {
    id: 3,
    title: 'third',
  },
];

export default function ReactUsageComponent() {
  const [{selected_ids, order_by, order_dir}, UpdateQueryString] = useQueryParser(
    window.location.search,
    Schema,
    {
      onSetAction: 'push',
    }
  );

  function setSort(orderBy: typeof order_by, orderDir: typeof order_dir) {
    // if orderDir is desc we send "undefined" to skip the param
    UpdateQueryString({order_by: orderBy, order_dir: orderDir === 'asc' ? 'asc' : undefined});
  }

  const onClickSelect = (id: number) => () => {
    let newSelectedIDs = selected_ids || [];
    if (newSelectedIDs.findIndex(_id => _id === id) >= 0) {
      newSelectedIDs = newSelectedIDs.filter(_id => _id !== id);
    } else {
      newSelectedIDs.push(id);
    }

    UpdateQueryString({selected_ids: newSelectedIDs.length ? newSelectedIDs : undefined});
  };

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
            {JSON.stringify(
              {selected_ids, order_by, order_dir},
              (k, v) => (v === undefined ? '(undefined)' : v),
              2
            )}
          </SyntaxHighlighter>
        </small>
      </Alert>
      <Card>
        <Card.Body>
          <Card.Title>Demo table</Card.Title>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>
                  ID{' '}
                  <a
                    href="/"
                    onClick={e => {
                      e.preventDefault();
                      setSort('id', order_dir === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    {order_by === 'id' ? 'reverse order' : 'sort'}
                  </a>
                </th>
                <th>
                  Title{' '}
                  <a
                    href="/"
                    onClick={e => {
                      e.preventDefault();
                      setSort('title', order_dir === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    {order_by === 'title' ? 'reverse order' : 'sort'}
                  </a>
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(item => (
                <tr key={item.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      id={`default-${item.id}`}
                      checked={Boolean(selected_ids?.find(id => id === item.id))}
                      onClick={onClickSelect(item.id)}
                    />
                  </td>
                  <td>{item.id}</td>
                  <td>{item.title}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}
