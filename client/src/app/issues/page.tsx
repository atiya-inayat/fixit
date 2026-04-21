'use client';

import { useEffect, useState } from 'react';
import { IssueCard } from '@/components/IssueCard';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const categories = ['All', 'Infrastructure', 'Sanitation', 'Environment', 'Safety', 'Public Services', 'Other'];
const statuses = ['All', 'reported', 'in_progress', 'resolved'];

export default function IssuesPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'All') params.set('category', category);
    if (status !== 'All') params.set('status', status);

    api.get(`/issues?${params.toString()}`)
      .then(res => setIssues(res.data.issues))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, status]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Community Issues</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex gap-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {statuses.map((s) => (
          <Button
            key={s}
            variant={status === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatus(s)}
          >
            {s === 'All' ? 'All' : s.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-64" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No issues found</p>
          <p className="text-sm">Be the first to report a problem in your community!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {issues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
