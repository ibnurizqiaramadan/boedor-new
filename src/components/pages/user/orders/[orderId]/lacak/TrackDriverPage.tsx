'use client';

import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../../../../../convex/_generated/api';
import { Id } from '../../../../../../../convex/_generated/dataModel';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { TrackDriverHeader } from './TrackDriverHeader';
import { TrackDriverMap } from './TrackDriverMap';

export default function TrackDriverPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const canView = !!user && user.role === 'user';
  const mapRef = useRef<MapRef | null>(null);
  const [ hasCentered, setHasCentered ] = useState(false);
  const [ followDriver, setFollowDriver ] = useState(false);

  // Fetch order to get driverId
  const order = useQuery(
    api.boedor.orders.getOrderById,
    canView && user ? { orderId: orderId as Id<'boedor_orders'>, currentUserId: user._id } : 'skip',
  );

  // Fetch driver's username
  const driverUser = useQuery(
    api.boedor.users.getUsernamesByIds,
    canView && order && user ?
      { userIds: [ order.driverId as Id<'boedor_users'> ], currentUserId: user._id } :
      'skip',
  );

  // Fetch driver position using driverId from order
  const driverPosition = useQuery(
    api.boedor.driverPositions.getDriverPosition,
    canView && order && user ? { driverId: order.driverId as Id<'boedor_users'>, currentUserId: user._id } : 'skip',
  );

  const center = useMemo(() => {
    if (driverPosition) {
      return { longitude: driverPosition.lng, latitude: driverPosition.lat, zoom: 15 };
    }
    // Default center if no driver position yet (Jakarta)
    return { longitude: 106.84513, latitude: -6.21462, zoom: 11 };
  }, [ driverPosition ]);

  // Auto-center to driver only once when the first position arrives
  useEffect(() => {
    if (!driverPosition || hasCentered) return;
    const { lng, lat } = driverPosition;
    mapRef.current?.flyTo({ center: [ lng, lat ], zoom: 15, duration: 600 });
    setHasCentered(true);
  }, [ driverPosition, hasCentered ]);

  // Keep following driver when locked
  useEffect(() => {
    if (!driverPosition || !followDriver) return;
    const { lng, lat } = driverPosition;
    mapRef.current?.easeTo({ center: [ lng, lat ], duration: 400 });
  }, [ driverPosition, followDriver ]);

  return (
    <Layout>
      {!canView ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">Akses ditolak. Khusus pengguna.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <TrackDriverHeader
            orderId={orderId}
            driverPosition={driverPosition}
            followDriver={followDriver}
            onBack={() => router.back()}
            onToggleFollow={() => setFollowDriver((v) => !v)}
          />

          <TrackDriverMap
            center={center}
            driverPosition={driverPosition}
            driverUser={driverUser?.[0]}
            mapRef={mapRef}
          />
        </div>
      )}
    </Layout>
  );
}