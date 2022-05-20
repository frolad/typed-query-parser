import {useEffect, useRef, useState} from 'react';
import {ParserSettings as QueryParserSettings, QueryValueType} from './model';
import {ParseQuery, SchemaTypes} from './parser';
import {StringifyOn} from './stringify';

type History = {
  location: {
    search: string;
  };
  push: (location: {search?: string}) => void;
  replace: (location: {search?: string}) => void;
};

type Response<O extends {[_: string]: QueryValueType}> = [
  {[K in keyof O]: O[K]['defaultValue']},
  (
    queryVars: Partial<{[K in keyof O]: O[K]['defaultValue'] | undefined}>,
    action?: 'push' | 'replace'
  ) => string
];

type ParserSettings = Omit<QueryParserSettings, 'shouldThrow'> & {
  onUpdateAction?: 'push' | 'replace';
};

function useQueryParser<O extends {[_: string]: QueryValueType}>(
  history: History,
  schema_builder: (types: SchemaTypes) => O,
  parser_settings?: ParserSettings
): Response<O>;

function useQueryParser<O extends {[_: string]: QueryValueType}>(
  history: History,
  schema: O,
  parser_settings?: ParserSettings
): Response<O>;

function useQueryParser<O extends {[_: string]: QueryValueType}>(
  query_string: string,
  schema_builder: (types: SchemaTypes) => O,
  parser_settings?: ParserSettings
): Response<O>;

function useQueryParser<O extends {[_: string]: QueryValueType}>(
  query_string: string,
  schema: O,
  parser_settings?: ParserSettings
): Response<O>;

function useQueryParser<O extends {[_: string]: QueryValueType}>(
  query: string | History,
  schema: (types: SchemaTypes) => O | O,
  parser_settings?: ParserSettings
): Response<O> {
  const queryString = typeof query === 'string' ? query : query.location.search;
  const {onUpdateAction, ...settings} = parser_settings || {};

  const currentQueryString = useRef(queryString);
  const currentSchema = useRef(schema);
  const currentSettings = useRef(settings);

  const [parsedQuery, setParsedQuery] = useState(
    ParseQuery(queryString, currentSchema.current, currentSettings.current)
  );

  const modifyQueryString = (
    queryVars: Partial<{[K in keyof O]: O[K]['defaultValue'] | undefined}>,
    action?: 'push' | 'replace'
  ) => {
    const newQuery = StringifyOn(queryString, queryVars, currentSettings.current);

    action = action || onUpdateAction;
    if (action) {
      if (typeof query !== 'string') {
        query[action]({search: newQuery});
      } else {
        if (typeof window !== 'undefined') {
          window.history[`${action}State`](
            null,
            '',
            `${window.location.pathname}${
              newQuery.length && newQuery[0] !== '?' ? '?' : ''
            }${newQuery}`
          );
        }
      }
    }

    currentQueryString.current = newQuery;
    setParsedQuery(s => ({...s, ...queryVars}));

    return newQuery;
  };

  useEffect(() => {
    // prevent extra parsing on initial load
    if (currentQueryString.current !== queryString) {
      currentQueryString.current = queryString;
      setParsedQuery(ParseQuery(queryString, currentSchema.current, currentSettings.current));
    }
  }, [queryString]);

  return [parsedQuery, modifyQueryString];
}

export {useQueryParser};
