import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

function LocationMarker({ onLocationSelect, initialLat, initialLng }: { 
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialLat && initialLng ? L.latLng(initialLat, initialLng) : null
  );

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      // Get address from coordinates using free Nominatim API
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          'User-Agent': 'BOCHABERI-Construction-App/1.0'
        }
      })
        .then(res => res.json())
        .then(data => {
          const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          onLocationSelect(lat, lng, address);
        })
        .catch(() => {
          onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        });
    },
  });

  return position === null ? null : <Marker position={position} draggable={true} />;
}

export function LeafletMapPicker({ onLocationSelect, initialLat, initialLng, initialAddress }: LeafletMapPickerProps) {
  const defaultCenter: [number, number] = [initialLat ?? -1.2921, initialLng ?? 36.8219];
  const [searchAddress, setSearchAddress] = useState(initialAddress || '');
  const [isSearching, setIsSearching] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);

  const searchLocation = async () => {
    if (!searchAddress) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`,
        {
          headers: {
            'User-Agent': 'BOCHABERI-Construction-App/1.0'
          }
        }
      );
      const data = await response.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const displayName = data[0].display_name;
        
        // Center map on searched location
        if (map) {
          map.setView([lat, lng], 18);
        }
        
        onLocationSelect(lat, lng, displayName || searchAddress);
      } else {
        alert('Location not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for location. Please check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const getMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (map) {
            map.setView([latitude, longitude], 18);
          }
          onLocationSelect(latitude, longitude, `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        },
        (error) => {
          alert('Unable to get your location. Please check your permissions.');
          console.error(error);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          placeholder="Search for an address (e.g., Nairobi, Kenya)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
        />
        <button
          onClick={searchLocation}
          disabled={isSearching}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={getMyLocation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
        >
          My Location
        </button>
      </div>
      
      <MapContainer
        center={defaultCenter}
        zoom={15}
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          onLocationSelect={onLocationSelect} 
          initialLat={initialLat}
          initialLng={initialLng}
        />
      </MapContainer>
      
      <p className="text-xs text-gray-500 text-center">
        💡 Click anywhere on the map to set the exact project location. You can also search for an address or use "My Location".
      </p>
    </div>
  );
}