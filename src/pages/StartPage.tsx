import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

interface ILocalProps {
}
type Props = ILocalProps & RouteComponentProps<{}>;

const StartPage: React.FC<Props> = (props) => {

  return (
    <div className=''>

    </div>
  );
}

export default StartPage;
