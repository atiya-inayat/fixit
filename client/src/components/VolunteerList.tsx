'use client';

import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

interface Volunteer {
  user: string;
  userName: string;
  skills: string[];
  joinedAt: string;
}

const skillColors: Record<string, string> = {
  labor: 'bg-blue-100 text-blue-800',
  transport: 'bg-purple-100 text-purple-800',
  technical: 'bg-orange-100 text-orange-800',
  funding: 'bg-green-100 text-green-800',
};

export function VolunteerList({ volunteers }: { volunteers: Volunteer[] }) {
  if (volunteers.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No volunteers yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <Users className="h-4 w-4" />
        Volunteers ({volunteers.length})
      </h3>
      {volunteers.map((v, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
          <span className="font-medium text-sm">{v.userName}</span>
          <div className="flex gap-1">
            {v.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className={`text-xs ${skillColors[skill] || ''}`}>
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
