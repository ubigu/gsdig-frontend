import React from 'react';
import { PlaylistAddCheck } from '@material-ui/icons';
import { useTranslations } from '@src/translation/TranslationContext';
import FabControl from './FabControl';

interface Props {
  onClick: () => void
}

export default function WorkspaceDialogControl({
  onClick,
} : Props) {
  const { tr } = useTranslations();
  return (
    <FabControl
      tooltip={tr.WorkspaceDialog.tooltip}
      onClick={onClick}
    >
      <PlaylistAddCheck />
    </FabControl>
  )
}