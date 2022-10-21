/** React OpenLayers wrapper
 * @see https://openlayers.org/
 */

/** React */
import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';

/** OL imports */
import 'ol/ol.css';
import OLMap from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature';
import Projection from 'ol/proj/Projection';
import Overlay from 'ol/Overlay';
import { defaults as defaultInteractions, Interaction } from 'ol/interaction';
import Collection from 'ol/Collection';

import { makeStyles } from '@material-ui/core/styles';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import Control from 'ol/control/Control';

const useStyles = makeStyles({
  fullSize: {
    width: '100%',
    height: '100%',
  },
});

/** Map component */
const Map = forwardRef<{ getCurrentZoom: () => number, getCurrentCenter: () => [number, number]}, Props>((props, ref) => {
  const classes = useStyles();

  /**
   * OpenLayers View: @see https://openlayers.org/en/latest/apidoc/module-ol_View-View.html
   * View's projection is defined based on the target country (area): E.g. EPSG:3067 in Finland
   */

  const [olView] = useState(() => {
    return new View({
      center: [0, 0],
      /** Projection for displaying map tiles properly */
      projection: props.projection,
      zoom: props.zoom,
      /** Resolution constrain makes zooming less smooth,
       * but removes tile border artefacts from e.g. vector tiles */
      constrainResolution: props.constrainResolution,
      maxZoom: props.maxZoom,
      minZoom: props.minZoom,
      multiWorld: false,
      constrainOnlyCenter: false,
      smoothExtentConstraint: false,
      showFullExtent: true,
      enableRotation: false,
      ...(props.extent && { extent: props.extent }),
    });
  });

  /**
   * OpenLayers Map: @see https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html
   * "For a map to render, a view, one or more layers, and a target container are needed" -docs
   */
  const [olMap] = useState(() => {
    return new OLMap({
      layers: [],
      target: '',
      view: olView,
      controls: props.controls ?? [],
      interactions:
        props.defaultInteractions ||
        defaultInteractions({
          altShiftDragRotate: false,
          pinchRotate: false,
          doubleClickZoom: false,
          shiftDragZoom: false,
        }),
    });
  });

  /**
   * OpenLayers Overlay element
   * @see https://openlayers.org/en/latest/apidoc/module-ol_Overlay.html
   * 'positioning' attribute specifies the overlay -elements position respect to its own 'position' property
   * 'offset' specifies the offset [horizontal, vertical] (in pixels) when positioning the overlay
   * Set Overlay's 'position' -property with Overlay.setPosition() method
   */
  const [olOverlay] = useState(() => {
    return new Overlay({
      stopEvent: true,
    });
  });

  /* Map reference definitions */
  const mapRef = useRef(null);
  const overlayRef = useRef(null);

  /** Other state variables */
  /** Store the current interactions so they can be removed before adding any new ones */
  const [currentInteractions, setCurrentInteractions] = useState([]);
  /** Map event keys are stored so that they can be unbinded later on */
  const [mapEventKeys, setMapEventKeys] = useState([]);

  /** 
   * Handlers for imperative function calls from the parent
   */
  useImperativeHandle(ref, () => ({
    getCurrentZoom: () => {
      if (!olView) return;
      return olView.getZoom();
    },
    getCurrentCenter: () => {
      if (!olView) return;
      return olView.getCenter() as [number, number];
    }
  }));

  /** Mount map to its container after the Map instance is created */
  useEffect(() => {
    olMap.setTarget(mapRef.current);
  }, [olMap]);

  /** If extent is changed, fit the view accordingly */
  useEffect(() => {
    if (props.fitToExtent) {
      olMap.getView().fit(props.fitToExtent);
    }
  }, [props.fitToExtent]);

  /** Mount Overlay -instance to its reference container, and bind it to Map */
  useEffect(() => {
    olMap.addOverlay(olOverlay);
    olOverlay.setElement(overlayRef.current);
  }, [olOverlay]);

  /** Bind/unbind map event listeners */
  useEffect(() => {
    if (props.eventListeners) {
      /** Unbind previous event listereners based on the stored event keys */
      mapEventKeys.map((key) => olMap.un(key.type, key.listener));
      /** Bind/set new event keys */
      const newEventKeys = props.eventListeners.map(({ eventType, callback }) =>
        olMap.on(eventType, callback)
      );
      setMapEventKeys(newEventKeys);
    }
  }, [props.eventListeners]);

  /** Listen to changes in interations, e.g., Draw, Snap, DragBox etc. */
  useEffect(() => {
    /** Remove current interactions before adding new ones */
    currentInteractions.map((interaction) =>
      olMap.removeInteraction(interaction)
    );

    if (props.interactions && props.interactions.length !== 0) {
      props.interactions.map((interaction) =>
        olMap.addInteraction(interaction)
      );
      setCurrentInteractions(props.interactions);
    }
  }, [props.interactions]);

  /** Add OpenLayer-layers to map */
  useEffect(() => {
    olMap.getAllLayers().forEach(l => olMap.removeLayer(l));
    props.layers.forEach(l => olMap.addLayer(l));
  }, [props.layers]);

  /** Re-render map on command */
  useEffect(() => {
    olMap.updateSize();
  }, [props.refresher]);

  /** Center map based on received props */
  useEffect(() => {
    if (props.center && props.center.filter(Boolean).length === 2) {
      olMap.getView().setCenter(props.center);
    }
  }, [props.center]);

  /** Focus map on demand */
  useEffect(() => {
    if (mapRef && mapRef.current) mapRef.current.focus();
  }, [props.toggleFocus]);

  /** Update Map's zoom level */
  useEffect(() => {
    if (props.zoom) {
      olView.setZoom(props.zoom);
    }
  }, [props.zoom]);

  /** Actual HTML content of the overlay -element */
  // const overlayContent = React.Children.toArray(props.children).find((child: React.ReactElement) => child.type.displayName === 'Overlay');

  /** Shifts the application's focus back to the map container. */
  const reFocus = () => {
    mapRef.current.focus();
  };

  return (
    <div className={classes.fullSize}>
      <div
        ref={mapRef}
        tabIndex={1}
        className={classes.fullSize}
        onMouseEnter={reFocus}
        onTouchMove={reFocus}
      />
      {/* <div ref={overlayRef} className={classes.overlayContainer}>
        {overlayContent}
      </div> */}
      {props.children}
    </div>
  );
});

Map.displayName = 'Map';

/** Props definitions */
interface Props {
  /** Center map to specified coordinates in [x, y] format */
  center?: Coordinate;
  /** React elements passed as children to Map component */
  children?: React.ReactNode;
  /** OpenLayers interactions that persist through the component's lifetime
   * @see https://openlayers.org/en/latest/apidoc/module-ol_interaction.html
   * @see https://openlayers.org/en/latest/apidoc/module-ol_Collection-Collection.html
   */
  defaultInteractions?: Collection<Interaction>;
  /** Event/callback pairs to pass different map events above */
  eventListeners?: {
    eventType: 'click' | 'singleclick';
    callback: (event?: any) => void;
  }[];
  /** OpenLayers interactions that change over time (Draw, Snap, DragBox etc.)
   * @see https://openlayers.org/en/latest/apidoc/module-ol_interaction.html
   */
  interactions?: Interaction[];
  /** OpenLayers TileLayers which are added to the map instance
   * @see https://openlayers.org/en/latest/apidoc/module-ol_layer_Tile-TileLayer.html
   */
  layers?: (any)[];
  // PropTypes.arrayOf(PropTypes.object),
  /** Openlayers Features which are added to their own vector source.
   * Use this to display map markers on the map.
   * @see https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html
   */
  markers?: Feature[];
  /** Projection of the map
   * @see https://openlayers.org/en/latest/apidoc/module-ol_proj_Projection-Projection.html
   */
  projection: Projection;
  /** OpenLayers might need some refreshing after DOM changes */
  refresher?: boolean;
  /** Toggler for focusing the map on demand */
  toggleFocus?: boolean;
  /** Maximum extent of the map's view, in corresponding coordinate system
   * @see https://openlayers.org/en/latest/apidoc/module-ol_extent.html#~Extent
   */
  extent?: Extent;
  /** Fit the map into an extent */
  fitToExtent?: Extent;
  /** Zoom level for the view (e.g. 12) */
  zoom?: number;
  /** Maximum zoom level for the view */
  maxZoom?: number;
  /** Minimum zoom level for the view */
  minZoom?: number;
  /** The size of a single zoom step */
  zoomStep?: number;
  /** Props passed onto the zoom component */
  zoomProps?: {};
  /** Should view zooming be constrained? */
  constrainResolution?: boolean;
  /** Position of the overlay elements in [x, y] -coordinates */
  overlayPosition?: number[];
  controls?: Control[];
}

/** Default props */
Map.defaultProps = {
  maxZoom: 16,
  minZoom: 3,
} as Props;

export default Map;
