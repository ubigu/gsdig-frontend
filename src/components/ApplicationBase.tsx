import React, { useState, useRef, ElementRef } from 'react';
import { Dialog, makeStyles, Paper, Typography, Table, TableRow, TableCell } from '@material-ui/core';
import Map from './Map';
import SideBar from './SideBar'
import FeatureTable from './FeatureTable';
import { authRequest } from '@src/utils/request';
import { useTranslations } from '@src/translation/TranslationContext';

import GeoJSON from 'ol/format/GeoJSON';
import TileLayer from 'ol/layer/Tile';
import { Extent } from 'ol/extent';
import { Vector as VectorSource } from 'ol/source';
import VectorLayer from 'ol/layer/Vector';
import { get as getProjection } from 'ol/proj';
import WMTS, { Options } from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import Layer from 'ol/layer/Layer';
import Style, { StyleLike } from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import SelectInteraction from 'ol/interaction/Select';
import Modify from 'ol/interaction/Modify';
import Snap from 'ol/interaction/Snap';
import { click } from 'ol/events/condition';
import ArealDivisionList from './ArealDivisionList';
import UnitDataList from './UnitDataList';
import PropertyWithTitle from '@src/interfaces/PropertyWithTitle';
import Workspace from '@src/interfaces/Workspace';
// import BackgroundLayerList from './BackgroundLayerList';
import BackgroundLayer from '@src/interfaces/BackgroundLayer';
import BackgroundLayerDialog from './BackgroundLayerDialog';
import BackgroundLayerDialogControl from './BackgroundLayerDialogControl';
import TopLeftControls from './TopLeftControls';
import TopRightControls from './TopRightControls';
import BottomLeftControls from './BottomLeftControls';
import BottomRightControls from './BottomRightControls';
import SaveWorkspaceControl from './SaveWorkspaceControl';
import LayerSettings from '@src/interfaces/LayerSettings';
import LanguageSelectorDialog from './LanguageSelectorDialog';
import LanguageSelectorDialogControl from './LanguageSelectorDialogControl';
import WorkspaceDialogControl from './WorkspaceDialogControl';
import WorkspaceDialog from './WorkspaceDialog';
import GSDIGInfoPage from './GSDIGInfoPage';
import GSDIGUserGuide from './GSDIGUserGuide';
// import MergeFeaturesControl from './MergeFeaturesControl';
import MergeFeaturesDialog from './MergeFeaturesDialog';
import UploadManager from './UploadManager';
import JoinData from './JoinData';
import ZoomInControl from './ZoomInControl';
import ZoomOutControl from './ZoomOutControl';
import Control from 'ol/control/Control';
import Attribution from 'ol/control/Attribution';
import { useKeycloak } from '@react-keycloak/web';
import ArealDivisionMetadata from '@src/interfaces/ArealDivisionMetadata';
import LayerSelector from './LayerSelector';
import { Feature } from 'ol';
import { Interaction } from 'ol/interaction';
import StyleEditor from './StyleEditor';
import FabControl from './FabControl';
import { Edit as EditIcon, Help, Info, Save as SaveIcon } from '@material-ui/icons';
import ConfirmDialog from './ConfirmDialog';

const useStyles = makeStyles((theme) => ({
  applicationBase: {
    width: '100vw',
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
      minHeight: 'auto',
      height: '100vh',
    },
  },
  map: {
    position: 'relative',
    flexGrow: 0,
    flexBasis: 400,
    [theme.breakpoints.up('md')]: {
      flexGrow: 1,
      flexBasis: 'auto',
    },
  },
  sideBar: {
    width: '100%',
    flexGrow: 1,
    zIndex: 0,
    [theme.breakpoints.up('md')]: {
      flexGrow: 0,
      width: '50%',
      minWidth: 500,
      height: '100%',
      overflow: 'auto',
    },
  }  
}));

const projection = getProjection('EPSG:3067');

interface EditLayer {
  uuid: string
  ol: VectorLayer<VectorSource>
}

// const defaultStyleFunction = new VectorLayer().getStyleFunction();
/**
 * Base application component.
 */
export default function ApplicationBase() {
  /** Reference for the Map component for imperative function calls*/
  const mapRef = useRef<ElementRef<typeof Map>>();

  const classes = useStyles();
  const { tr } = useTranslations();
  const { initialized, keycloak } = useKeycloak();

  React.useEffect(() => {
    if (keycloak && initialized) {
      keycloak.onTokenExpired = () => keycloak.updateToken(600);
    }
    return () => {
      if (keycloak) keycloak.onTokenExpired = () => {};
    };
  }, [initialized, keycloak]);


  const [selectInteraction] = useState<SelectInteraction>(() => {
    const interaction = new SelectInteraction({
      style: () => {
        return new Style({
          fill: new Fill({ color: 'rgba(255, 131, 112, 1)' }),
          stroke: new Stroke({ color: '#7E7F9A', width: 1 }),
          zIndex: 500,
        });
      },
      condition: click,
      toggleCondition: (e) => {
        const oe = e.originalEvent;
        return !oe.altKey && !(oe.metaKey || oe.shiftKey) && oe.ctrlKey;
      },
      multi: true,
    });
    // TODO: implement active layer switching - which layer to interact with?
    interaction.on('select', (e) => {
      const deselectedIds = e.deselected.map(it => it.getId());
      const selectedIds = e.selected.map(it => it.getId());
      setSelectedFeatures(prev => {
        const next = deselectedIds.length ? prev.filter(it => !deselectedIds.includes(it)) : prev;
        return selectedIds.length ? next.concat(selectedIds) : next;
      });        
    });
    return interaction;
  });

  const [interactions, setInteractions] = React.useState<Interaction[]>([selectInteraction]);

  const [activeLayer, setActiveLayer] = useState<EditLayer>(null);
  const [features, setFeatures] = useState<VectorSource>(null);
  const [tx, setTx] = React.useState<{ add: Feature, del: Feature }[][]>(null);
  const [confirmCancelTx, setConfirmCancelTx] = React.useState<Function>(null);
  const [modifyStart] = React.useState<Feature[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<(string | number)[]>([]);

  const [mapLayers, setMapLayers] = useState<Layer[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace>(null);
  const [selectedArealDivision, setSelectedArealDivision] = useState<{ ad: ArealDivisionMetadata, opacity: number, visible: boolean }>(null);

  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState<boolean>(true);
  const [mergeDialogOpen, setMergeDialogOpen] = React.useState<boolean>(false);
  const [backgroundLayerDialogOpen, setBackgroundLayerDialogOpen] = useState<boolean>(false);
  const [languageSelectorDialogOpen, setLanguageSelectorDialogOpen] = useState<boolean>(false);
  const [aboutDialogOpen, setAboutDialogOpen] = useState<boolean>(false);
  const [userGuideDialogOpen, setUserGuideDialogOpen] = useState<boolean>(false);
  const [invalidGeometries, setInvalidGeometries] = useState<{ [featureId: string]: string }>();

  const [backgroundLayers, setBackgroundLayers] = useState<BackgroundLayer[]>([]);
  
  const [controls] = useState<Control[]>([new Attribution({className: 'ol-attribution', collapsible: false})]);
  const [fitToExtent, setFitToExtent] = useState<Extent>([-548576.0, 6291456.0, 1548576.0, 8388608.0]);
  const [center, setCenter] = useState<number[]>([0, 0]);
  const [zoom, setZoom] = useState<number>(0);

  const [minZoom] = useState<number>(3);
  const [maxZoom] = useState<number>(16);

  const cloneFeature = (f: Feature) => {
    const clone = f.clone();
    clone.setStyle(null);
    clone.setId(f.getId());
    return clone;
  }

  const createModifyInteraction = () => {
    const interaction = new Modify({ features: selectInteraction.getFeatures() });
    interaction.on('modifystart', e => {
      modifyStart.length = 0;
      e.features.getArray().forEach(fe => modifyStart.push(cloneFeature(fe as Feature)));
    });    
    interaction.on('modifyend', e => {
      const adds = e.features.getArray().map(fe => cloneFeature(fe as Feature));
      const edits = modifyStart.map(del => (
        {
          del: del,
          add: adds.find(it => it.getId() === del.getId())
        }
      ));
      setTx(prev => [...prev, edits]);
    });
    return interaction;
  }
  const createSnapInteraction = (source: VectorSource) => new Snap({source: source});

  React.useEffect(() => {
    if (!selectedArealDivision) {
      setMapLayers(prev => prev.filter(it => it.get('type') !== 'data'));
      setActiveLayer(null);
      return;
    }
    const ad = selectedArealDivision.ad;
    const olLayer = createOAPIFLayer("/api/features", ad.uuid, ad.title);
    olLayer.setOpacity(selectedArealDivision.opacity);
    olLayer.setVisible(selectedArealDivision.visible);
    setMapLayers(prev => [...prev.filter(it => it.get('type') !== 'data'), olLayer]);  
    setActiveLayer({ ol: olLayer, uuid: ad.uuid })
  }, [selectedArealDivision]);

  const toggleMapLayer = (layer: Layer) => {
    const id = layer.get('id');
    setMapLayers(prev => prev.map(it => {
      if (it.get('id') === id) {
        it.setVisible(!it.getVisible());
      }
      return it;
    }));
  }

  const changeOpacity = (layer: Layer, opacity: number) => {
    const id = layer.get('id');
    setMapLayers(prev => prev.map(it => {
      if (it.get('id') === id) {
        it.setOpacity(opacity / 100);
      }
      return it;
    }));
  }

  function createWMTSLayer(uuid: string, title: string, options: { [key: string]: any }) {
    const olOptions: Options = {
      ...options,
      layer: options.layer,
      style: options.style,
      matrixSet: options.matrixSet,
      attributions: options.attributions,
      tileGrid: new WMTSTileGrid(options.tileGrid)
    };
    const tile = new TileLayer({
      source: new WMTS(olOptions),
      zIndex: -1
    });
    tile.set('id', uuid);
    tile.set('type', 'background');
    tile.set('title', title);
    return tile;
  }

  function createOAPIFLayer(endPoint: string, collectionId: string, title?: string) {
    const geojson = new GeoJSON({ featureProjection: projection });
    const vectorSource = new VectorSource({
      format: geojson,
      loader: async function() {
        const crs = "http://www.opengis.net/def/crs/EPSG/0/3067";
        const url = `${endPoint}/collections/${collectionId}/items?limit=2500&crs=${crs}`;
        const opt = {
          'headers': {
            'Authorization': 'Bearer ' + keycloak.token
          }
        };
        for (let next = url; next;) {
          next = await fetch(next, opt)
              .then(r => r.json())
              .then(json => {
                  vectorSource.addFeatures(geojson.readFeatures(json));
                  return json.links?.find((link: any) => link.rel === 'next')?.href ?? null;
              });
        }
        setFeatures(vectorSource);
      }
    })
    const layer = new VectorLayer({source: vectorSource});
    layer.set('id', collectionId);
    layer.set('title', title ?? collectionId);
    layer.set('type', 'data');
    return layer;
  }

  React.useEffect(() => {
    if (!selectedWorkspace) {
      setBackgroundLayers([]);
      return;
    }

    if (selectedWorkspace.dataLayer) {
      authRequest<ArealDivisionMetadata>(`/api/arealdivisions/${selectedWorkspace.dataLayer.uuid}`, keycloak)
      .then(it => setSelectedArealDivision({
        ad: it,
        opacity: selectedWorkspace.dataLayer.opacity ?? 1,
        visible: selectedWorkspace.dataLayer.visible ?? true
      }));
    }
    
    authRequest<BackgroundLayer[]>("/api/background-layers", keycloak)
    .then(bglayers => {
      setBackgroundLayers(bglayers);
      const selectedBGLayers = selectedWorkspace.backgroundLayers.reduce((prev, curr) => {
        const meta = bglayers.find(it => it.uuid === curr.uuid)
        if (meta) {
          const olLayer = createWMTSLayer(meta.uuid, meta.title, meta.options);
          olLayer.setOpacity(curr.opacity);
          olLayer.setVisible(curr.visible);
          return [...prev, olLayer];
        }
        return prev;
      }, []);
      if (selectedWorkspace.dataLayer) {
        setMapLayers(prev => [...selectedBGLayers, ...prev.filter(it => it.get('type') !== 'background')]);  
      } else {
        setMapLayers(selectedBGLayers);
      }
    });

    setCenter(selectedWorkspace.center);
    setZoom(selectedWorkspace.zoom);
    
    return () => setBackgroundLayers([]);
  }, [selectedWorkspace]);

  React.useEffect(() => {
    if (invalidGeometries) {
      setSelectedFeaturesTo(Object.keys(invalidGeometries));
    } else {
      clearSelectedFeatures();
    }
  }, [invalidGeometries])

  const addToTx = (edit: { add: Feature, del: Feature }) => {
    if (edit.del) {
      features.removeFeature(features.getFeatureById(edit.del.getId()));
    }
    if (edit.add) {
      features.addFeature(edit.add);
    }
    setTx(prev => [...prev, [edit]]);
  }

  const beginTx = () => {
    if (tx || !features) {
      return;
    }
    setTx([]);
    setInteractions([selectInteraction, createModifyInteraction(), createSnapInteraction(features)]);
  }

  const rollbackTx = () => {
    if (!tx || !features) {
      return;
    }

    const ids = new Set<string | number>();

    tx.forEach(event => {
      event.forEach(edit => {
        const add = edit.add;
        const id = add.getId();
        if (ids.has(id)) {
          return;
        }
        ids.add(id);
        const feature = features.getFeatureById(id);
        selectInteraction.getFeatures().remove(feature);
        features.removeFeature(feature);
      })
    });

    ids.clear();

    const sf = selectedFeatures;

    tx.forEach(event => {
      event.forEach(edit => {
        const del = edit.del;
        const id = del.getId();
        if (ids.has(id)) {
          ids.add(id);
        }
        if (sf.some(it => it === id)) {
          selectInteraction.getFeatures().push(del);
        }
        features.addFeature(del);
      });
    });

    setTx(null);
    setInteractions([selectInteraction]);
  }
  
  const commitTx = () => {
    if (!tx) {
      return;
    }
    
    const geojson = new GeoJSON({ featureProjection: projection });

    // TODO: Handle new and deleted features
    const lastEditByFeatureId: { [id: string | number]: Feature } = {};
    tx.forEach(event => {
      event.forEach(edit => {
        lastEditByFeatureId[edit.add.getId()] = edit.add;
      });
    });
    const body = Object.values(lastEditByFeatureId).map(e => geojson.writeFeatureObject(e));

    authRequest<void>(`/api/features/collections/${activeLayer.uuid}/items`, keycloak, {
        method: "PUT",
        body: body
    })
    .then(() => {
      setTx(null);
      setInteractions([selectInteraction]);
    })
    .catch(() => alert("Failed to commit transaction!"));
  }

  const handleSelectFeature = (id: string | number) => {
    const feature = features.getFeatureById(id);
    if (selectedFeatures.some(it => it === id)) {
      selectInteraction.getFeatures().remove(feature);
      setSelectedFeatures(prev => prev.filter(p => p !== id));
    } else {
      selectInteraction.getFeatures().push(feature);
      setSelectedFeatures(prev => [...prev, id]);
    }
  }
  
    
  const setSelectedFeaturesTo = (featureIds: (string | number)[]) => {
    selectInteraction.getFeatures().clear();
    featureIds.forEach(featureId => {
      const feature = features.getFeatureById(featureId);
      selectInteraction.getFeatures().push(feature);
    });
    setSelectedFeatures(featureIds);
  }

  const clearSelectedFeatures = () => {
    selectInteraction.getFeatures().clear();
    setSelectedFeatures([]);
  }

  const selectBackgroundLayer = (backgroundLayer: BackgroundLayer) => {
    setMapLayers(prev => {
      if (prev.some(it => it.get('id') === backgroundLayer.uuid)) {
        return prev;
      } else {
        const layer = createWMTSLayer(backgroundLayer.uuid, backgroundLayer.title, backgroundLayer.options);
        layer.setOpacity(0.5);
        return [layer, ...prev.filter(it => it.get('type') === 'data')];
      }
    });
  }

  const getAllProperties = () : PropertyWithTitle[] => selectedArealDivision?.ad
    ? Object.entries(selectedArealDivision.ad.attributes).map(([property, info]) => ({ property: property, title: info.title }))
    : [];

  const handleEditWorkspace = () => {
    const workspace = selectedWorkspace;
    if (!workspace) {
      return;
    }

    const center = mapRef.current.getCurrentCenter();
    const zoom = mapRef.current.getCurrentZoom();

    const bgLayers: LayerSettings[] = mapLayers.reduce((prev, curr) => {
      if (curr.get('type') === 'background') {
        const layer = {
          uuid: curr.get('id'),
          opacity: curr.getOpacity(),
          visible: curr.getVisible()
        }
        return [...prev, layer];
      }
      return prev;
    }, []);

    const dataMapLayer = mapLayers.find(it => it.get('type') === 'data');
    const dataLayer = dataMapLayer ?
    {
      uuid: dataMapLayer.get('id') as string,
      opacity: dataMapLayer.getOpacity(),
      visible: dataMapLayer.getVisible()
    } : null;
    
    authRequest<Workspace>(`/api/workspaces/${workspace.uuid}`, keycloak, {
      method: "PUT",
      body: {
        ...workspace,
        center: center,
        zoom: zoom,
        backgroundLayers: bgLayers,
        dataLayer: dataLayer
      }
    });
  }

  /*
  const handleMergeFeatures = (properties: any) => {
    const olLayer = activeLayer.ol;
    const body = {
      featureIds: selectedFeatures,
      properties: properties
    }
    selectInteraction.getFeatures().clear();
    setSelectedFeatures([]);
    authRequest<void>(`/apif/features/collections/${activeLayer.uuid}/merge`, keycloak {
        method: "POST",
        body: body
    })
    .then(() => olLayer.getSource().refresh());
  }

  const handleUnmergeFeature = () => {
    const selectedFeatureId = selectedFeatures[0];
    const olLayer = activeLayer.ol;
    selectInteraction.getFeatures().clear();
    setSelectedFeatures([]);
    request<void>(`/api/gsdig/features/collections/${activeLayer.uuid}/items/${selectedFeatureId}/unmerge`, {
        method: "POST"
    })
    .then(() => olLayer.getSource().refresh());
  }

  <MergeFeaturesControl
    selectedFeatures={selectedFeatures}
    onMergeClick={() => setMergeDialogOpen(true)}
    onUnmergeClick={() => {}}
  />
  */

  if (!keycloak.token) {
    return <div>Logging in...</div>
  }
  return (
    <div className={classes.applicationBase}>
      <div className={classes.map}>
        <Map
            controls={controls}
            ref={mapRef}
            center={center}
            zoom={zoom}
            fitToExtent={fitToExtent}
            layers={mapLayers}
            constrainResolution={true}
            projection={projection}
            interactions={interactions}
        >
          <TopLeftControls>
            <WorkspaceDialogControl onClick={() => setWorkspaceDialogOpen(true)} />
            <SaveWorkspaceControl onClick={handleEditWorkspace} />
            <FabControl
              disabled={!features}
              color={tx ? "secondary" : "primary"}
              tooltip={tr.Common.editTx}
              onClick={tx
                  ? () => {
                      if (tx?.length) {
                        setConfirmCancelTx(() => rollbackTx)
                      } else {
                        rollbackTx();
                      }
                    }
                  : beginTx
              }
            >
              <EditIcon />
            </FabControl>
            <FabControl disabled={!tx} tooltip={tr.Common.commitTx} onClick={commitTx}>
              <SaveIcon />
            </FabControl>
          </TopLeftControls>
          <TopRightControls>
            <ZoomInControl onClick={() => setZoom(Math.min(maxZoom, mapRef.current.getCurrentZoom() + 1))} />
            <ZoomOutControl onClick={() => setZoom(Math.max(minZoom, mapRef.current.getCurrentZoom() - 1))} />
          </TopRightControls>
          <BottomLeftControls>
            <BackgroundLayerDialogControl onClick={() => setBackgroundLayerDialogOpen(true)} />
            <LanguageSelectorDialogControl onClick={() => setLanguageSelectorDialogOpen(true)} />
            <FabControl
              tooltip={tr.Common.about}
              onClick={() => setAboutDialogOpen(true)}
            >
              <Info />
            </FabControl>
            <FabControl
              tooltip={tr.Common.help}
              onClick={() => setUserGuideDialogOpen(true)}
            >
              <Help />
            </FabControl>
          </BottomLeftControls>
          <BottomRightControls>
            <StyleEditor
              selected={selectedArealDivision?.ad}
              features={features}
              onStyleChange={(style: StyleLike) => activeLayer?.ol.setStyle(style)}
            />
          </BottomRightControls>
        </Map>
      </div>
      <Paper square className={classes.sideBar} elevation={3}>
        <SideBar
          titles={[
            tr.SideBar.layers,
            tr.SideBar.arealdivision,
            tr.SideBar.features,
            tr.SideBar.unitdata,
            tr.SideBar.join,
            tr.SideBar.upload,
          ]} 
        >
          <LayerSelector
            mapLayers={mapLayers}
            handleVisibilityChange={toggleMapLayer}
            handleOpacityChange={changeOpacity}
          />
          <ArealDivisionList
            selected={selectedArealDivision?.ad}
            onSelect={(ad) => {
              if (tx?.length) {
                setConfirmCancelTx(() => () => {
                  rollbackTx();
                  setSelectedArealDivision({ ad: ad, opacity: 1, visible: true });
                });
              } else {
                rollbackTx();
                setSelectedArealDivision({ ad: ad, opacity: 1, visible: true });
              }
            }}
            onZoomToExtent={setFitToExtent}
            onHighlightInvalid={setInvalidGeometries}
          />
          <FeatureTable
            selected={selectedArealDivision?.ad}
            source={features}
            columns={getAllProperties()}
            selectedFeatures={selectedFeatures}
            onSelectFeature={handleSelectFeature}
            tx={tx}
            addToTx={addToTx}
          />
          <UnitDataList onZoomToExtent={setFitToExtent}/>
          <JoinData />
          <UploadManager />
        </SideBar>
      </Paper>
      {workspaceDialogOpen &&
        <WorkspaceDialog
          handleClose={() => setWorkspaceDialogOpen(false)}
          selectedWorkspace={selectedWorkspace}
          onSelectWorkspace={setSelectedWorkspace}
        />
      }
      {mergeDialogOpen &&
        <MergeFeaturesDialog
          propertyNames={[]}
          onCancel={() => setMergeDialogOpen(false)}
          onSubmit={(_) => {
            setMergeDialogOpen(false);
            // handleMergeFeatures(properties);
          }}
        />
      }
      {backgroundLayerDialogOpen &&
        <BackgroundLayerDialog
          handleClose={() => setBackgroundLayerDialogOpen(false)}
          layers={backgroundLayers}
          onSelect={selectBackgroundLayer}
        />
      }
      {languageSelectorDialogOpen &&
        <LanguageSelectorDialog onClose={() => setLanguageSelectorDialogOpen(false)} />
      }
      {aboutDialogOpen &&
        <GSDIGInfoPage onClose={() => setAboutDialogOpen(false)} />
      }
      {userGuideDialogOpen &&
        <GSDIGUserGuide onClose={() => setUserGuideDialogOpen(false)} />
      }
      {invalidGeometries &&
      <Dialog
        open={!!invalidGeometries}
        onClose={() => {
          setInvalidGeometries(null);
        }}
      >
        <Table size="small">
          <TableRow>
            <TableCell>id</TableCell>
            <TableCell>reason</TableCell>
          </TableRow>
          {Object.keys(invalidGeometries).map(featureId => 
            <TableRow key={`${featureId}-err`}><TableCell>{featureId}</TableCell><TableCell>{invalidGeometries[featureId]}</TableCell></TableRow>
          )}
        </Table>       
      </Dialog>
      }
      {!!confirmCancelTx &&
      <ConfirmDialog
        title={tr.Common.unsavedEditsTitle}
        onConfirm={(confirmed) => {
          if (confirmed) {
            confirmCancelTx();
          }
          setConfirmCancelTx(null);
        }}
      >
        <Typography>{tr.Common.unsavedEditsWillBeLost}</Typography>
      </ConfirmDialog>
      }
    </div>
  );
}
