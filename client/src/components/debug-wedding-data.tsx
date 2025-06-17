import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import type { Wedding } from '@shared/schema';

export function DebugWeddingData() {
  const params = useParams();
  const weddingUrl = params.uniqueUrl as string;

  const { data: wedding, isLoading, error } = useQuery<Wedding>({
    queryKey: [`/api/weddings/url/${weddingUrl}`],
    enabled: !!weddingUrl,
  });

  return (
    <div className="p-4 bg-gray-100 border rounded m-4">
      <h3 className="font-bold mb-2">Debug Wedding Data</h3>
      <p><strong>Wedding URL:</strong> {weddingUrl}</p>
      <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
      <p><strong>Error:</strong> {error ? JSON.stringify(error) : 'None'}</p>
      <p><strong>Wedding Data:</strong></p>
      {wedding ? (
        <pre className="text-xs bg-white p-2 rounded overflow-auto">
          {JSON.stringify(wedding, null, 2)}
        </pre>
      ) : (
        <p>No wedding data</p>
      )}
    </div>
  );
}