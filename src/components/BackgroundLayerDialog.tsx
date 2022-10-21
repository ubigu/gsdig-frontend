import React from 'react';
import { Dialog, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@material-ui/core';
import { Map as MapIcon } from '@material-ui/icons';
import BackgroundLayer from '@src/interfaces/BackgroundLayer';

interface Props {
  handleClose: () => void,
  layers: BackgroundLayer[],
  onSelect: (layer: BackgroundLayer) => void,
}

export default function BackgroundLayerDialog({
  handleClose,
  layers,
  onSelect
} : Props) {
  return (
    <Dialog
      open
      onClose={handleClose}
    >
      <List>
        {layers.map(it =>
        <ListItem
          key={it.uuid}
          button
          onClick={() => {
            onSelect(it);
            handleClose();
          }}
        >
          <ListItemAvatar>
            <Avatar>
              <MapIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText>
            {it.title}
          </ListItemText>
        </ListItem>
        )}
      </List>
    </Dialog>
  )
}