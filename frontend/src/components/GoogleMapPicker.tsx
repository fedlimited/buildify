import { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, Polygon, useLoadScript } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, Layers, Draw } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

const defaultCenter = { lat: -1.2921, lng: 36.8219 }; // Nairobi

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  mapTypeControlOptions: {
    position: 1, // TOP_RIGHT
    style: 0 // HORIZONTAL_BAR
  },
  drawingControl: true,
  drawingControlOptions: {
    drawingModes: ['polygon', 'marker']
  }
};

interface GoogleMapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onBoundarySave?: (boundary: any) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string;
  initialBoundary?: any;
  readOnly?: boolean;
}

export function GoogleMapPicker({
  onLocationSelect,
  onBoundarySave,
  initialLat,
  initialLng,
  initialAddress,
  initialBoundary,
  readOnly = false
}: GoogleMapPickerProps) {
  const [markerPosition, setMarkerPosition] = useState(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [searchAddress, setSearchAddress] = useState(initialAddress || '');
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [boundary, setBoundary] = useState(initialBoundary || null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'drawing', 'geometry'],
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Enable drawing tools
    if (!readOnly && window.google) {
      const drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          editable: true,
          draggable: true,
          fillColor: '#f59e0b',
          fillOpacity: 0.3,
          strokeColor: '#f59e0b',
          strokeWeight: 2,
        },
      });
      drawingManager.setMap(map);
      drawingManagerRef.current = drawingManager;

      // Listen for polygon completion
      google.maps.event.addListener(drawingManager, 'overlaycomplete', (event: any) => {
        if (event.type === 'polygon') {
          const polygon = event.overlay;
          const path = polygon.getPath();
          const coordinates = [];
          for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            coordinates.push({ lat: point.lat(), lng: point.lng() });
          }
          setBoundary(coordinates);
          if (onBoundarySave) {
            onBoundarySave(coordinates);
          }
        }
      });
    }
  }, [readOnly, onBoundarySave]);

  const searchLocation = async () => {
    if (!searchAddress || !window.google) return;
    setIsSearching(true);
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchAddress }, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(18);
        }
        setMarkerPosition({ lat, lng });
        onLocationSelect(lat, lng, results[0].formatted_address);
        setSearchAddress(results[0].formatted_address);
      } else {
        alert('Location not found. Please try a different address.');
      }
    });
  };

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(18);
        }
        setMarkerPosition({ lat, lng });
        onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setIsSearching(false);
      },
      (error) => {
        setIsSearching(false);
        alert('Unable to get your location. Please check your permissions.');
      }
    );
  };

  const toggleMapType = () => {
    if (map) {
      const currentType = map.getMapTypeId();
      if (currentType === 'roadmap') {
        map.setMapTypeId('satellite');
      } else if (currentType === 'satellite') {
        map.setMapTypeId('hybrid');
      } else {
        map.setMapTypeId('roadmap');
      }
    }
  };

  if (loadError) {
    return (
      <div className="h-[400px] rounded-lg border border-red-500 flex items-center justify-center bg-red-50">
        <div className="text-center text-red-500">
          <p>Error loading Google Maps</p>
          <p className="text-xs mt-1">Please check your API key and internet connection</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[400px] rounded-lg border border-border flex items-center justify-center bg-muted">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            placeholder="Search for address (e.g., Nairobi, Kenya)"
            className="pr-8"
          />
          <Search 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
            onClick={searchLocation}
          />
        </div>
        <Button variant="outline" size="sm" onClick={getMyLocation} disabled={isSearching}>
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          <span className="ml-1 hidden sm:inline">My Location</span>
        </Button>
        <Button variant="outline" size="sm" onClick={toggleMapType} title="Toggle Satellite/Map">
          <Layers className="h-4 w-4" />
          <span className="ml-1 hidden sm:inline">Satellite</span>
        </Button>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={markerPosition || defaultCenter}
        zoom={15}
        onLoad={onMapLoad}
        options={mapOptions as any}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={!readOnly}
            onDragEnd={(e) => {
              if (e.latLng) {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setMarkerPosition({ lat, lng });
                onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                // Reverse geocode for address
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: { lat, lng } }, (results) => {
                  if (results && results[0]) {
                    setSearchAddress(results[0].formatted_address);
                    onLocationSelect(lat, lng, results[0].formatted_address);
                  }
                });
              }
            }}
          />
        )}
        
        {boundary && (
          <Polygon
            paths={boundary}
            options={{
              fillColor: '#f59e0b',
              fillOpacity: 0.3,
              strokeColor: '#f59e0b',
              strokeWeight: 2,
              editable: !readOnly,
              draggable: !readOnly,
            }}
          />
        )}
      </GoogleMap>

      <p className="text-xs text-muted-foreground text-center">
        💡 Click on map to set marker | Use drawing tools (top-center) to draw site boundary | Toggle Satellite for aerial view
      </p>
    </div>
  );
}