import React from 'react';
import { Tooltip, Fab, PropTypes } from '@material-ui/core';

interface Props {
  onClick: () => void,
  tooltip: string,
  color?: PropTypes.Color,
  disabled?: boolean,
  children: JSX.Element | JSX.Element[]
}

export default function FabControl({
  onClick,
  tooltip,
  color = "primary",
  disabled = false,
  children
} : Props) {
  return (
    <Tooltip arrow title={tooltip}>
      <span>
        <Fab
          disabled={disabled}
          color={color}
          onClick={onClick}
        >
          {children}
        </Fab>
      </span>
    </Tooltip>
  )
}