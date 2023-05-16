import React, { Component } from 'react';
import { Alert } from 'antd';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: false };
  }

  static getDerivedStateFromError() {
    return { error: true };
  }

  render() {
    if (this.state.hasError) {
      <Alert message="Warning! Something is wrong. " type="error" showIcon closable />;
    }

    return this.props.children;
  }
}
