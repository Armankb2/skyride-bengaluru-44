import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';

interface MapComponentProps {
  pickupLocation: { lat: number; lng: number; address: string } | null;
  destinationLocation: { lat: number; lng: number; address: string } | null;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
}

const MapComponent = ({ pickupLocation, destinationLocation, onMapClick }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const destinationMarker = useRef<mapboxgl.Marker | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Bengaluru center coordinates
  const BENGALURU_CENTER: [number, number] = [77.5946, 12.9716];

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY200NW9teG5jMDQyZDJqcHp0MGV1Zjk4cyJ9.0dQk6ZqLvXZjG1w3q_cIsA';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: BENGALURU_CENTER,
      zoom: 11,
      pitch: 0,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setIsMapReady(true);
    });

    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick(e.lngLat);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [onMapClick]);

  useEffect(() => {
    if (!map.current || !isMapReady) return;

    // Update pickup marker
    if (pickupLocation) {
      if (pickupMarker.current) {
        pickupMarker.current.setLngLat([pickupLocation.lng, pickupLocation.lat]);
      } else {
        const el = document.createElement('div');
        el.className = 'w-8 h-8 bg-primary rounded-full border-4 border-white shadow-lg flex items-center justify-center';
        el.innerHTML = '<div class="w-3 h-3 bg-white rounded-full"></div>';
        
        pickupMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat([pickupLocation.lng, pickupLocation.lat])
          .addTo(map.current);
      }
    }

    // Update destination marker
    if (destinationLocation) {
      if (destinationMarker.current) {
        destinationMarker.current.setLngLat([destinationLocation.lng, destinationLocation.lat]);
      } else {
        const el = document.createElement('div');
        el.className = 'w-8 h-8 bg-accent rounded-full border-4 border-white shadow-lg flex items-center justify-center';
        el.innerHTML = '<div class="w-3 h-3 bg-white rounded-full"></div>';
        
        destinationMarker.current = new mapboxgl.Marker({ element: el })
          .setLngLat([destinationLocation.lng, destinationLocation.lat])
          .addTo(map.current);
      }
    }

    // Draw route if both locations are set
    if (pickupLocation && destinationLocation && map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }

    if (pickupLocation && destinationLocation) {
      const coordinates = [
        [pickupLocation.lng, pickupLocation.lat],
        [destinationLocation.lng, destinationLocation.lat],
      ];

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates,
          },
        },
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': 'hsl(204, 94%, 45%)',
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });

      // Fit bounds to show both markers
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach((coord) => bounds.extend(coord as [number, number]));
      map.current.fitBounds(bounds, { padding: 100, duration: 1000 });
    }
  }, [pickupLocation, destinationLocation, isMapReady]);

  return (
    <Card className="relative w-full h-[500px] md:h-[600px] overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MapComponent;