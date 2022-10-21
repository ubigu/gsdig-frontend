import React from 'react';
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, CircularProgress, FormGroup, Typography } from '@material-ui/core';
import { useTranslations } from '@src/translation/TranslationContext';
import { useKeycloak } from '@react-keycloak/web';
import { authRequest } from '@src/utils/request';

interface UploadInfo {
  uuid: string,
  typeName: string,
  extent: number[],
  srid: number,
  attributes: { [key: string]: string }
}

interface Props {
  onClose: () => void,
  onUpload: (info: UploadInfo[]) => void
}

export default function UploadFromURLDialog({ onClose, onUpload } : Props) {
  const { tr } = useTranslations();
  const { keycloak } = useKeycloak();

  const [loading, setLoading] = React.useState<boolean>(false);

  const [url, setUrl] = React.useState<string>(null);
  const [username, setUsername] = React.useState<string>(null);
  const [password, setPassword] = React.useState<string>(null);
  
  return (
    <Dialog
      open
      fullWidth
      onClose={onClose}
    >
      <DialogTitle>{tr.Import.fromUrl}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">{tr.Import.formats}</Typography>
        <FormGroup>
          <TextField
            required
            id="url-input"
            name="url"
            label={tr.Common.url}
            type="text"
            value={url || ''}
            onChange={e => setUrl(e.target.value)}
          />
          <TextField
            id="username-input"
            name="username"
            label={tr.Common.username}
            type="text"
            value={username || ''}
            onChange={e => setUsername(e.target.value)}
          />
          <TextField
            id="password-input"
            name="password"
            label={tr.Common.password}
            type="text"
            value={password || ''}
            onChange={e => setPassword(e.target.value)}
          />
        </FormGroup>
      </DialogContent>
      <DialogActions>
        { loading && <CircularProgress /> }
        <Button
          variant="outlined"
          color="secondary"
          onClick={onClose}
        >
          {tr.Common.cancel}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            setLoading(true);
            authRequest<UploadInfo[]>(`/api/uploads/url`, keycloak, {
              method: 'POST',
              body: {
                url: url,
                username: username,
                password: password
              }
            })          
            .then(onUpload)
            .then(onClose)
          }}
        >
          {tr.Import.import}
        </Button>
      </DialogActions>
    </Dialog>
  )
}