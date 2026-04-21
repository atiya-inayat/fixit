'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocationPicker } from '@/components/LocationPicker';
import { Camera } from 'lucide-react';
import api from '@/lib/api';

const categories = ['Infrastructure', 'Sanitation', 'Environment', 'Safety', 'Public Services', 'Other'];

export default function NewIssuePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latitude || !longitude) return setError('Please select a location on the map');
    if (photos.length === 0) return setError('At least one photo is required');

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    photos.forEach((photo) => formData.append('photos', photo));

    try {
      const { data } = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      router.push(`/issues/${data.issue._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create issue');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Report a Problem</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-3 rounded-md">{error}</div>
        )}

        <div>
          <label className="text-sm font-medium">Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the problem"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide more details about the issue..."
            className="w-full border rounded-md p-3 text-sm min-h-[100px] resize-y"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Category *</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`p-2 rounded-md border text-sm transition-colors ${
                  category === cat ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Photos * (at least one)</label>
          <div className="mt-1">
            <label className="flex items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {photos.length > 0 ? `${photos.length} photo(s) selected` : 'Click to upload photos'}
                </p>
              </div>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                className="hidden"
              />
            </label>
          </div>
          {photos.length > 0 && (
            <div className="flex gap-2 mt-2">
              {photos.map((p, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(p)}
                  alt={`Preview ${i}`}
                  className="h-20 w-20 object-cover rounded-md border"
                />
              ))}
            </div>
          )}
        </div>

        <LocationPicker
          onLocationSelect={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
        />

        <Button type="submit" className="w-full" disabled={loading || !category}>
          {loading ? 'Submitting...' : 'Report Issue'}
        </Button>
      </form>
    </div>
  );
}
