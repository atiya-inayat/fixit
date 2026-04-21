'use client';

import { Clock, User, HandHeart, DollarSign, CheckCircle, Flag, AlertCircle } from 'lucide-react';

interface TimelineEvent {
  type: string;
  description: string;
  userId?: string;
  createdAt: string;
}

const eventIcons: Record<string, any> = {
  reported: AlertCircle,
  volunteer_joined: HandHeart,
  donation: DollarSign,
  status_change: Clock,
  resolved: CheckCircle,
  flagged: Flag,
};

const eventColors: Record<string, string> = {
  reported: 'text-red-500',
  volunteer_joined: 'text-purple-500',
  donation: 'text-green-500',
  status_change: 'text-yellow-500',
  resolved: 'text-green-600',
  flagged: 'text-orange-500',
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Activity Timeline
      </h3>
      <div className="space-y-2">
        {events.map((event, i) => {
          const Icon = eventIcons[event.type] || Clock;
          const color = eventColors[event.type] || 'text-gray-500';

          return (
            <div key={i} className="flex items-start gap-3 py-2">
              <div className={`mt-0.5 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm">{event.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
