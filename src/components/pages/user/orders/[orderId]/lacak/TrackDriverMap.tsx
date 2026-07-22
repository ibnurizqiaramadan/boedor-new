import { Card, CardContent } from '@/components/ui/card';
import { Map, Marker } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import { useMemo } from 'react';
import { MapPin, Bike } from 'lucide-react';
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
  // Dark raster basemap (Carto) to match the app theme
  const darkStyle = useMemo<StyleSpecification>(() => ({
    version: 8 as 8,
    sources: {
      'carto-dark': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors © CARTO',
      },
    },
    layers: [
      {
        id: 'carto-dark',
        type: 'raster',
        source: 'carto-dark',
      },
    ],
  }), []);

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-0">
        <div className="h-[70vh] w-full">
          <Map
            reuseMaps
            initialViewState={center}
            mapStyle={darkStyle as any}
            style={{ width: '100%', height: '100%' }}
            ref={mapRef}
          >
            {driverPosition && (
              <Marker longitude={driverPosition.lng} latitude={driverPosition.lat} anchor="bottom">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 rounded-full border bg-card/95 px-2.5 py-1 shadow-lg">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-400/15 text-blue-400">
                      <Bike className="h-3 w-3" aria-hidden />
                    </span>
                    <span className="text-xs font-medium">{driverUser?.name || driverUser?.username || 'Driver'}</span>
                  </div>
                  <MapPin className="-mt-0.5 h-5 w-5 text-primary" fill="currentColor" aria-hidden />
                </div>
              </Marker>
            )}
          </Map>
        </div>
        {!driverPosition && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="rounded-lg border bg-card/90 px-4 py-3 text-sm text-muted-foreground shadow-lg backdrop-blur">
              Menunggu posisi pengemudi...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
