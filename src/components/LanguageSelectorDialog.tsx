import React from 'react';
import { useTranslations } from '@src/translation/TranslationContext';
import { Dialog, List, ListItem, ListItemText } from '@material-ui/core';

interface Props {
  onClose: () => void,
}

export default function LanguageSelectorDialog({
  onClose,
} : Props) {
  const { setLanguage, language, translations } = useTranslations();

  return (
    <Dialog
      open
      onClose={onClose}
    >
      <List>
        {translations.map(lang =>
        <ListItem
          selected={lang === language}
          key={lang}
          button
          onClick={() => {
            setLanguage(lang);
            onClose();
          }}
        >
          <ListItemText primary={lang} />
        </ListItem>
        )}
      </List>
    </Dialog>
  )
}