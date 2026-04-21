'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapView } from '@/components/MapView';
import { IssueCard } from '@/components/IssueCard';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [mapIssues, setMapIssues] = useState<any[]>([]);
  const [recentIssues, setRecentIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/issues/map'),
      api.get('/issues'),
    ])
      .then(([mapRes, issuesRes]) => {
        setMapIssues(mapRes.data.issues);
        setRecentIssues(issuesRes.data.issues.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">
              <MapPin className="inline h-8 w-8 text-red-500 mr-2" />
              FixIt — From Ideas to Collective Action
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Report local problems, rally community support, track funding transparency,
              and verify resolutions with AI-powered photo comparison.
            </p>
          </div>

          {loading ? (
            <div className="animate-pulse h-[400px] bg-gray-100 rounded-lg" />
          ) : (
            <MapView
              issues={mapIssues}
              className="h-[400px]"
              onMarkerClick={(id) => router.push(`/issues/${id}`)}
            />
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> Reported</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500" /> In Progress</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500" /> Resolved</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Issues</h2>
          <Link href="/issues">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {recentIssues.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No issues yet. Be the first to report a problem!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentIssues.map((issue) => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
