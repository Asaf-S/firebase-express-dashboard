// import { graphql, PageProps } from "gatsby"
import * as React from 'react';
import Layout from '../components/layout';
import Source from '../components/source';

export default class IndexPage extends React.Component {
  readonly hello = `Hello`;
  public render() {
    return (
      <Layout>
        <h1>{this.hello} TypeScript world!</h1>
        <p>
          This site is named <strong>aaa</strong>
        </p>
        <Source description="Interested in details of this site?" />
      </Layout>
    );
  }
}
