import React from 'react';
import { Save as SaveIcon } from '@material-ui/icons';
import { useTranslations } from '@src/translation/TranslationContext';
import FabControl from './FabControl';

interface Props {
  onClick: () => void  
}

export default function WorkspaceDialogControl({
  onClick
} : Props) {
  const { tr } = useTranslations();
  return (
    <FabControl
      tooltip={tr.WorkspaceDialog.saveChanges}
      onClick={onClick}
    >
      <SaveIcon />
    </FabControl>
  )
}