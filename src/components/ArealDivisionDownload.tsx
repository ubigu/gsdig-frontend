import React from 'react';
import { IconButton, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { useTranslations } from '@src/translation/TranslationContext';
import { GetApp } from '@material-ui/icons';
import { useKeycloak } from '@react-keycloak/web';

interface DownloadFormat {
  id: string,
  title: string
}

const formats: DownloadFormat[] = [
  { id: "gpkg", title: "GeoPackage (.gpkg)" },
  { id: "json", title: "GeoJSON (.json)" },
  { id: "shp", title: "ESRI Shapefile (.shp.zip)" },
  { id: "csv", title: "Comma Separated Value (.csv)" },
  { id: "tsv", title: "Tab Separated Value (.tsv)" },
  { id: "xlsx", title: "Microsoft Excel (.xlsx)" },
];

function download(fileUrl: string) {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileUrl;
  a.click();
}

interface Props {
  collectionId: string
}

export default function DataAggregateDownload({ collectionId }: Props) {
  const { tr } = useTranslations();
  const { keycloak } = useKeycloak();

  const [anchor, setAnchor] = React.useState<null | HTMLElement>(null);

  const handleClick = (f: DownloadFormat) => {
    setAnchor(null);
    
    fetch(`/api/download?collectionId=${collectionId}&format=${f.id}`, {
      headers: {
        Authorization: "Bearer " + keycloak.token,
      }
    }).then(response => {
      const location = response.headers.get('Location');
      download(location);
    });
  };

  return (
    <>
      <Tooltip title={tr.Common.downloadFile} >
        <IconButton onClick={e => setAnchor(e.currentTarget)}>
          <GetApp />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        MenuListProps={{
          role: 'listbox'
        }}
      >
        {formats.map(f => 
        <MenuItem
          key={`download-file-${f.id}`}
          onClick={() => handleClick(f)}
        >
          {f.title}
        </MenuItem>
        )}
      </Menu>
    </>
  )
}