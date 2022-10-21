import React from 'react';
import { Layers as LayersIcon } from '@material-ui/icons';
import { useTranslations } from '@src/translation/TranslationContext';
import FabControl from './FabControl';

interface Props {
  onClick: () => void;
}

export default function BackgroundLayerDialogControl({
  onClick
} : Props) {
  const { tr } = useTranslations();
  return (
    <FabControl
      tooltip={tr.BackgroundLayerDialog.tooltip}
      onClick={onClick}
    >
      <LayersIcon />
    </FabControl>
  )
}