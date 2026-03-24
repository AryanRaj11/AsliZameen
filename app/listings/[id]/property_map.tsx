"use client"; // This is the key

import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export default function PropertyMap({ position }: { position: { lat: number; lng: number } }) {
    // 1. Check if position exists and has valid coordinates
  const hasLocation = position && 
  typeof position.lat === 'number' && 
  typeof position.lng === 'number';

  if (!hasLocation) {
    return (
      <div className="h-[400px] w-full rounded-xl flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 text-slate-500">
        <div className="p-3 bg-slate-100 rounded-full mb-2">
          📍
        </div>
        <p className="font-medium">No location provided for this property</p>
        <p className="text-xs">Coordinates are required to display the map</p>
      </div>
    );
  }
  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm border">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <Map
          defaultCenter={position}
          defaultZoom={15}
          mapId="YOUR_MAP_ID" 
          gestureHandling={'greedy'}
        >
          <AdvancedMarker position={position}>
            <Pin background={'#ea4335'} glyphColor={'#000'} borderColor={'#000'} />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
}
