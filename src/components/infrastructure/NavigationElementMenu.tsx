import React from 'react';
import { Box, Menu, MenuItem, Typography } from '@mui/material';

// Types
import type { TypographyVariant } from '@mui/material';
import type { INavigationElement } from '../../navigation/navigationTypes.js';

interface ILocalProps {
  anchor: HTMLElement | null;
  anvhorOrigin?: { vertical: 'top' | 'bottom', horizontal: 'left' | 'center' | 'right' };
  elements?: Array<INavigationElement>;
  selectedElementIndex?: number;
  typoVariant?: TypographyVariant;
  onSelect: (e: React.MouseEvent<HTMLElement>, element: INavigationElement, index: number) => void;
  onClose?: (e: React.MouseEvent<HTMLElement>) => void;
}
type Props = ILocalProps;

const NavigationElementMenu: React.FC<Props> = (props) => {

  const renderItemIcon = (IconElement?: React.FunctionComponent<any> | React.ComponentType<any> | string) => {

    if (!IconElement)
      return (
        <Box sx={{ width: 36 }} />
      )

    if (typeof IconElement === 'string')
      return (
        <Box
          component='span'
          sx={{
            width: 36,
            fontSize: 24
          }}>
          {IconElement}
        </Box>
      );

    return (
      <IconElement style={{ width: 36 }} />
    )
  };

  if (!props.elements)
    return null;

  return (

    <Menu
      anchorEl={props.anchor}
      anchorOrigin={props.anvhorOrigin}
      open={Boolean(props.anchor)}
      onClose={props.onClose}>

      {props.elements.map((element, index) => {

        const elementIndex = props.elements!.indexOf(element);
        const isSelectedElement = (props.selectedElementIndex !== undefined) ? (props.selectedElementIndex === elementIndex) : false;

        return (

          <MenuItem
            key={elementIndex}
            selected={isSelectedElement}
            disabled={false}
            onClick={(e) => props.onSelect(e, element, elementIndex)} >

            {renderItemIcon(element.Icon)}

            <Box
              sx={{ width: (theme) => theme.spacing(2) }} />

            <Typography
              variant={(props.typoVariant !== undefined) ? props.typoVariant : 'h5'}>
              {element.name}
            </Typography>

          </MenuItem>
        )
      })}
    </Menu>
  );
};

export default NavigationElementMenu;
