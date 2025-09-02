'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';
import { Id } from '../../../../../../convex/_generated/dataModel';
import { Map, Marker } from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MapPin, LocateFixed } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { StyleSpecification } from 'maplibre-gl';

export default function TrackDriverPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const canView = !!user && user.role === 'user';
  const mapRef = useRef<MapRef | null>(null);
  const [hasCentered, setHasCentered] = useState(false);
  const [followDriver, setFollowDriver] = useState(false);

  // Fetch order to get driverId
  const order = useQuery(
    api.boedor.orders.getOrderById,
    canView && user ? { orderId: orderId as Id<'boedor_orders'>, currentUserId: user._id } : 'skip'
  );

  // Fetch driver's username
  const driverUser = useQuery(
    api.boedor.users.getUsernamesByIds,
    canView && order && user
      ? { userIds: [order.driverId as Id<'boedor_users'>], currentUserId: user._id }
      : 'skip'
  );

  // Fetch driver position using driverId from order
  const driverPosition = useQuery(
    api.boedor.driverPositions.getDriverPosition,
    canView && order && user ? { driverId: order.driverId as Id<'boedor_users'>, currentUserId: user._id } : 'skip'
  );

  const center = useMemo(() => {
    if (driverPosition) {
      return { longitude: driverPosition.lng, latitude: driverPosition.lat, zoom: 15 };
    }
    // Default center if no driver position yet (Jakarta)
    return { longitude: 106.84513, latitude: -6.21462, zoom: 11 };
  }, [driverPosition]);

  // Auto-center to driver only once when the first position arrives
  useEffect(() => {
    if (!driverPosition || hasCentered) return;
    const { lng, lat } = driverPosition;
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, duration: 600 });
    setHasCentered(true);
  }, [driverPosition, hasCentered]);

  // Keep following driver when locked
  useEffect(() => {
    if (!driverPosition || !followDriver) return;
    const { lng, lat } = driverPosition;
    mapRef.current?.easeTo({ center: [lng, lat], duration: 400 });
  }, [driverPosition, followDriver]);

  // MapLibre style object using OpenStreetMap raster tiles
  const osmStyle = useMemo<StyleSpecification>(() => ({
    version: 8 as 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
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
    <Layout>
      {!canView ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Akses ditolak. Khusus pengguna.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Button variant="outline" size="sm" onClick={() => router.back()} className="shrink-0">
                <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Lacak Pengemudi</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 sm:ml-auto">
              {driverPosition ? (
                <span className="whitespace-nowrap">Terakhir diperbarui: {new Date(driverPosition.updatedAt).toLocaleTimeString('id-ID')}</span>
              ) : (
                <span className="whitespace-nowrap">Menunggu posisi pengemudi...</span>
              )}
              <Button
                size="sm"
                variant={followDriver ? 'default' : 'outline'}
                onClick={() => setFollowDriver((v) => !v)}
                aria-pressed={followDriver}
                className="whitespace-nowrap"
                disabled={!driverPosition}
              >
                <LocateFixed className="h-4 w-4 mr-1" />
                {followDriver ? 'Terkunci' : 'Kunci ke Driver'}
              </Button>
            </div>
          </div>

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
                        <span className="text-xs font-medium">{driverUser?.[0]?.username ?? 'Driver'}</span>
                      </div>
                    </Marker>
                  )}
                </Map>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}
