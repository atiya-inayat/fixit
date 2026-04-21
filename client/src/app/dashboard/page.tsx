'use client';

import { useEffect, useState } from 'react';
import { MapView } from '@/components/MapView';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle, DollarSign, Users, TrendingUp, MapPin } from 'lucide-react';
import api from '@/lib/api';

interface Stats {
  totalIssues: number;
  resolvedCount: number;
  fundsRaised: number;
  fundsSpent: number;
  activeVolunteers: number;
  resolutionRate: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [mapIssues, setMapIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/issues/map'),
    ])
      .then(([statsRes, mapRes]) => {
        setStats(statsRes.data);
        setMapIssues(mapRes.data.issues);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto p-6 animate-pulse"><div className="h-96 bg-gray-100 rounded" /></div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Community Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={AlertTriangle} label="Total Issues" value={stats.totalIssues} color="text-red-500" />
          <StatCard icon={CheckCircle} label="Resolved" value={stats.resolvedCount} color="text-green-500" />
          <StatCard icon={DollarSign} label="Funds Raised" value={`Rs. ${stats.fundsRaised}`} color="text-blue-500" />
          <StatCard icon={DollarSign} label="Funds Spent" value={`Rs. ${stats.fundsSpent}`} color="text-orange-500" />
          <StatCard icon={Users} label="Volunteers" value={stats.activeVolunteers} color="text-purple-500" />
          <StatCard icon={TrendingUp} label="Resolution Rate" value={`${stats.resolutionRate}%`} color="text-green-600" />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Issues Map
        </h2>
        <MapView
          issues={mapIssues}
          className="h-[500px]"
          onMarkerClick={(id) => router.push(`/issues/${id}`)}
        />
        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> Reported</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> In Progress</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Resolved</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  return (
    <div className="bg-white border rounded-lg p-4 text-center">
      <Icon className={`h-6 w-6 mx-auto mb-1 ${color}`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
