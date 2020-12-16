import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ErrorContent } from '@daniel.neuweiler/react-lib-module';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    pageRoot: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      alignContent: 'center',
      justifyItems: 'center',
      justifyContent: 'center'
    }
  }),
);

interface ILocalProps {
  sourceName?: string;
  errorMessage?: string;
}
type Props = ILocalProps & RouteComponentProps<{}>;

const ErrorPage: React.FC<Props> = (props) => {

  // External hooks
  const classes = useStyles();

  // Helpers
  const sourceName = (props.sourceName !== undefined) ? props.sourceName : 'Unknown';
  const errorMessage = (props.errorMessage !== undefined) ? props.errorMessage : 'Unknown';

  return (

    <div className={classes.pageRoot}>

      <ErrorContent
        sourceName={sourceName}
        errorMessage={errorMessage} />

    </div>
  );
}

export default ErrorPage;