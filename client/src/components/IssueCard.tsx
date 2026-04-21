"use client";

import { assetUrl } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { MapPin, ThumbsUp, Users } from "lucide-react";
import Link from "next/link";

interface Issue {
  _id: string;
  title: string;
  category: string;
  status: string;
  photos: string[];
  latitude: number;
  longitude: number;
  upvotes: number;
  volunteers: any[];
  createdAt: string;
  reporterName: string;
}

const statusColors: Record<string, string> = {
  reported: "bg-red-100 text-red-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
};

const categoryIcons: Record<string, string> = {
  Infrastructure: "🏗️",
  Sanitation: "🧹",
  Environment: "🌳",
  Safety: "⚠️",
  "Public Services": "🏛️",
  Other: "📋",
};

export function IssueCard({ issue }: { issue: Issue }) {
  return (
    <Link href={`/issues/${issue._id}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
        {issue.photos[0] && (
          <img
            src={assetUrl(issue.photos[0])}
            alt={issue.title}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">
              {issue.title}
            </h3>
            <Badge className={statusColors[issue.status]}>
              {issue.status.replace("_", " ")}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span>{categoryIcons[issue.category] || "📋"}</span>
            <span>{issue.category}</span>
            <span>•</span>
            <span>{issue.reporterName}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              {issue.upvotes}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {issue.volunteers.length}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
