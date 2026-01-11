import { Card, CardContent } from '@/components/ui/card';
import { Map, Marker } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import type { StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { DriverPosition, User } from '@/lib/types';

interface TrackDriverMapProps {
  center: { longitude: number; latitude: number; zoom: number };
  driverPosition: DriverPosition | null;
  driverUser: User | null;
  mapRef: React.RefObject<MapRef | null>;
}

export function TrackDriverMap({ center, driverPosition, driverUser, mapRef }: TrackDriverMapProps) {
  // MapLibre style object using OpenStreetMap raster tiles
  const osmStyle = useMemo<StyleSpecification>(() => ({
    version: 8 as 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: [ 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'osm-tiles',
        type: 'raster',
        source: 'osm-tiles',
      },
    ],
  }), []);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="w-full h-[70vh]">
          <Map
            reuseMaps
            initialViewState={center}
            mapStyle={osmStyle as any}
            style={{ width: '100%', height: '100%' }}
            ref={mapRef}
          >
            {driverPosition && (
              <Marker longitude={driverPosition.lng} latitude={driverPosition.lat} anchor="bottom">
                <div className="flex items-center gap-1 bg-white/90 rounded-md px-2 py-1 shadow">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-medium">{driverUser?.username ?? 'Driver'}</span>
                </div>
              </Marker>
            )}
          </Map>
        </div>
      </CardContent>
    </Card>
  );
}