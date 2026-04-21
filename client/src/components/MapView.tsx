'use client';

import { useEffect, useRef, useState } from 'react';

interface MapIssue {
  _id: string;
  title: string;
  latitude: number;
  longitude: number;
  status: string;
  category: string;
}

const statusColors: Record<string, string> = {
  reported: '#ef4444',
  in_progress: '#eab308',
  resolved: '#22c55e',
};

interface MapViewProps {
  issues: MapIssue[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMarkerClick?: (id: string) => void;
}

export function MapView({ issues, center = [34.20, 72.05], zoom = 13, className = 'h-[500px]', onMarkerClick }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [leaflet, setLeaflet] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then((L) => {
      import('leaflet/dist/leaflet.css');
      setLeaflet(L.default);
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || !leaflet || mapRef.current) return;

    mapRef.current = leaflet.map(containerRef.current).setView(center, zoom);

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [leaflet]);

  useEffect(() => {
    if (!mapRef.current || !leaflet) return;

    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof leaflet.CircleMarker) {
        mapRef.current!.removeLayer(layer);
      }
    });

    issues.forEach((issue) => {
      const marker = leaflet.circleMarker([issue.latitude, issue.longitude], {
        radius: 10,
        fillColor: statusColors[issue.status] || '#6b7280',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <strong>${issue.title}</strong><br/>
        <span style="color: ${statusColors[issue.status]}">${issue.status.replace('_', ' ')}</span><br/>
        ${issue.category}
      `);

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(issue._id));
      }
    });
  }, [issues, leaflet, onMarkerClick]);

  return <div ref={containerRef} className={`rounded-lg ${className}`} />;
}
