import {Accordion, Card} from 'react-bootstrap';
import NativeUsageComponent from './NativeUsageExample';
import ReactUsageComponent from './ReactUsageExample';
import {ParseQuery} from 'typed-query-parser';

function App() {
  const parsed = ParseQuery(window.location.search, ({string}) => ({foo: string()}));

  return (
    <Card border="success" className="rounded-0">
      <Card.Header className="bg-success text-light rounded-0">
        <Card.Title>types-query-parser example of usage</Card.Title>
      </Card.Header>
      <Card.Body>
        <h6>first you need to import package</h6>
        <small>
          <pre className="p-2 bg-dark text-light">
            import {'{'}CreateSchema, ParseQuery, Stringify ...
            {'}'} from 'typed-query-parser';
          </pre>
        </small>
        <Accordion defaultActiveKey={typeof parsed.foo !== 'undefined' ? '0' : '1'}>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <Card.Title>Native usage</Card.Title>
            </Accordion.Header>
            <Accordion.Body>
              <NativeUsageComponent />
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              <Card.Title>React usage</Card.Title>
            </Accordion.Header>
            <Accordion.Body>
              <ReactUsageComponent />
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Card.Body>
    </Card>
  );
}

export default App;
