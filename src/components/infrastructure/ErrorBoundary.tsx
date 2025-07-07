import React, { Component } from 'react';

interface ILocalProps {
  children?: React.ReactNode;
  sourceName: string;
  onRenderFallback: (source: string, error: any, errorInfo: any) => React.ReactNode;
};
type Props = ILocalProps;

interface ILocalState {
  sourceName: string;
  error: any;
  errorInfo: any;
}
type State = ILocalState;

export class ErrorBoundary extends Component<Props, State> {

  // Fields
  private contextName: string = 'ErrorBoundary'

  constructor(props: Props) {
    super(props);

    this.state = {
      sourceName: this.props.sourceName,
      error: null,
      errorInfo: null
    };
  }

  componentDidCatch(error: any, info: any) {

    this.setState({
      error: error,
      errorInfo: info
    })

    if (info)
      console.error(`${error && error.toString()} ${info.componentStack} @'${this.props.sourceName}'`);
  };

  componentDidUpdate() {

    if (this.state.sourceName !== this.props.sourceName) {

      this.setState({
        sourceName: this.props.sourceName,
        error: null,
        errorInfo: null
      })
    }
  };

  render() {

    if (this.state.errorInfo)
      return this.props.onRenderFallback(this.state.sourceName, this.state.error, this.state.errorInfo)

    return this.props.children;
  };
}