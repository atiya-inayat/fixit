'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Crosshair } from 'lucide-react';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );

  useEffect(() => {
    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css');
      const lib = L.default;
      const svgIcon = lib.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
          <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="#ef4444"/>
          <circle cx="16" cy="16" r="7" fill="white"/>
        </svg>`,
        className: '',
        iconSize: [32, 40],
        iconAnchor: [16, 40],
      });
      (lib as any)._svgIcon = svgIcon;
      setLeaflet(lib);
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || !leaflet || mapRef.current) return;

    const defaultCenter: [number, number] = [34.20, 72.05];
    mapRef.current = leaflet.map(containerRef.current).setView(
      coords ? [coords.lat, coords.lng] : defaultCenter,
      14
    );

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current);

    if (coords) {
      markerRef.current = leaflet.marker([coords.lat, coords.lng], { icon: leaflet._svgIcon }).addTo(mapRef.current);
    }

    mapRef.current.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      setCoords({ lat, lng });
      onLocationSelect(lat, lng);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = leaflet.marker([lat, lng], { icon: leaflet._svgIcon }).addTo(mapRef.current!);
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [leaflet]);

  const detectLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        onLocationSelect(latitude, longitude);

        if (mapRef.current && leaflet) {
          mapRef.current.setView([latitude, longitude], 16);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            markerRef.current = leaflet.marker([latitude, longitude], { icon: leaflet._svgIcon }).addTo(mapRef.current);
          }
        }
      },
      () => alert('Could not detect location. Please click on the map to set it manually.')
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Location *</label>
        <Button type="button" variant="outline" size="sm" onClick={detectLocation}>
          <Crosshair className="h-4 w-4 mr-1" />
          Auto-detect GPS
        </Button>
      </div>
      <div ref={containerRef} className="h-[300px] rounded-lg border" />
      {coords && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
