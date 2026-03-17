import React, { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Place } from '../../../lib/opentripmap';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const MIN_RADIUS = 1000;
const MAX_RADIUS = 12000;

// @ts-expect-error Leaflet default icon typing does not expose private field.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const selectedIcon = L.icon({
  iconUrl:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41"><path d="M12.5 0C5.6 0 0 5.6 0 12.5 0 22.1 12.5 41 12.5 41S25 22.1 25 12.5C25 5.6 19.4 0 12.5 0z" fill="%23232b5c"/><circle cx="12.5" cy="12.5" r="5.5" fill="%23fff"/></svg>',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
  shadowAnchor: [12, 41],
});

const getViewportRadius = (map: L.Map) => {
  const bounds = map.getBounds();
  const center = bounds.getCenter();
  const radius = map.distance(center, bounds.getNorthEast());
  return Math.min(Math.max(radius, MIN_RADIUS), MAX_RADIUS);
};

const MapUpdater = ({
  center,
  shouldFlyRef,
}: {
  center: [number, number];
  shouldFlyRef: React.MutableRefObject<boolean>;
}) => {
  const map = useMap();
  useEffect(() => {
    if (!shouldFlyRef.current) return;
    map.setView(center, map.getZoom(), { animate: false });
    shouldFlyRef.current = false;
  }, [center, map, shouldFlyRef]);
  return null;
};

const MapMoveHandler = ({
  onMoveEnd,
  radiusRef,
}: {
  onMoveEnd: (center: [number, number], radius: number) => void;
  radiusRef: React.MutableRefObject<number>;
}) => {
  const map = useMapEvents({
    dragend: () => {
      const center = map.getCenter();
      const radius = getViewportRadius(map);
      radiusRef.current = radius;
      onMoveEnd([center.lat, center.lng], radius);
    },
    zoomend: () => {
      const center = map.getCenter();
      const radius = getViewportRadius(map);
      radiusRef.current = radius;
      onMoveEnd([center.lat, center.lng], radius);
    },
  });
  useEffect(() => {
    radiusRef.current = getViewportRadius(map);
  }, [map, radiusRef]);
  return null;
};

type TerkepNezetProps = {
  center: [number, number];
  tileUrl: string;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onMoveEnd: (center: [number, number], radius: number) => void;
  shouldFlyRef: React.MutableRefObject<boolean>;
  radiusRef: React.MutableRefObject<number>;
};

const TerkepNezet: React.FC<TerkepNezetProps> = ({
  center,
  tileUrl,
  places,
  selectedPlace,
  onSelectPlace,
  onMoveEnd,
  shouldFlyRef,
  radiusRef,
}) => {
  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
      <TileLayer url={tileUrl} attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>' />
      <MapUpdater center={center} shouldFlyRef={shouldFlyRef} />
      <MapMoveHandler onMoveEnd={onMoveEnd} radiusRef={radiusRef} />

      {places.map((place) => (
        <Marker
          key={place.xid}
          position={[place.point.lat, place.point.lon]}
          icon={selectedPlace?.xid === place.xid ? selectedIcon : defaultIcon}
          eventHandlers={{ click: () => onSelectPlace(place) }}
        >
          <Popup>{place.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default TerkepNezet;
