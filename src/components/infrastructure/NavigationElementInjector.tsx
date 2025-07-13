import React, { useMemo, Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { ErrorBoundary } from './ErrorBoundary.js';
import { ErrorContent } from './ErrorContent.js';

// Types
import type { INavigationElement, INavigationElementProps } from '../../navigation/navigationTypes.js';

interface ILocalProps {
  children?: React.ReactNode;
  navigationElement: INavigationElement | undefined;
  onInject: (navigationElement: INavigationElement) => React.LazyExoticComponent<React.ComponentType<INavigationElementProps>>;
};
type Props = ILocalProps;

const NavigationElementInjector: React.FC<Props> = (props) => {

  if (props.navigationElement === null || props.navigationElement === undefined)
    return null

  // Memoized lazy import of a component
  const GenericNavigationElement = useMemo((): React.LazyExoticComponent<React.ComponentType<INavigationElementProps>> => {

    if (props.navigationElement === null || props.navigationElement === undefined)
      return React.lazy(() => Promise.resolve({ default: () => null })); // Return a dummy component to satisfy the type

    return props.onInject(props.navigationElement);
  }, [props.navigationElement.key]);

  return (

    <ErrorBoundary
      sourceName={props.navigationElement.importPath}
      onRenderFallback={(source, error, errorInfo) => {
        return (

          <Box>

            <ErrorContent
              sourceName={source}
              errorMessage={error && error.toString()}
              stackInfo={errorInfo.componentStack} />
          </Box>
        )
      }}>
      <Suspense
        fallback={

          <Box
            sx={{
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              alignContent: 'center',
              justifyItems: 'center',
              justifyContent: 'center'
            }}>

            <CircularProgress
              color='primary'
              size={64} />
          </Box>
        }>

        <GenericNavigationElement />
      </Suspense>
    </ErrorBoundary>
  );
};

export default NavigationElementInjector;
