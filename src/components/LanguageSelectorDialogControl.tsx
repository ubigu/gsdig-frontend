import React from 'react';
import { Language as LanguageIcon } from '@material-ui/icons';
import { useTranslations } from '@src/translation/TranslationContext';
import FabControl from './FabControl';

interface Props {
  onClick: () => void;
}

export default function LanguageSelectorDialogControl({
  onClick
} : Props) {
  const { tr } = useTranslations();
  return (
    <FabControl
      tooltip={tr.LanguageSelectorControl.tooltip}
      onClick={onClick}
    >
      <LanguageIcon />
    </FabControl>
  )
}