import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

interface ILocalProps {
}
type Props = ILocalProps & RouteComponentProps<{}>;

const ErrorPage: React.FC<Props> = (props) => {

  return (
    <div>

    </div>
  );
}

export default ErrorPage;