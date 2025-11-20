import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationSearchProps {
  label: string;
  placeholder: string;
  value: Location | null;
  onChange: (location: Location) => void;
  type: 'pickup' | 'destination';
}

// Sample Bengaluru locations for MVP
const SAMPLE_LOCATIONS = [
  { name: 'MG Road', lat: 12.9762, lng: 77.6033 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7499 },
  { name: 'Electronic City', lat: 12.8456, lng: 77.6603 },
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'Indiranagar', lat: 12.9719, lng: 77.6412 },
  { name: 'HSR Layout', lat: 12.9082, lng: 77.6476 },
  { name: 'Bellandur', lat: 12.9259, lng: 77.6745 },
  { name: 'Yeshwanthpur', lat: 13.0281, lng: 77.5538 },
  { name: 'BTM Layout', lat: 12.9165, lng: 77.6101 },
  { name: 'JP Nagar', lat: 12.9082, lng: 77.5850 },
];

const LocationSearch = ({ label, placeholder, value, onChange, type }: LocationSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredLocations = SAMPLE_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (location: typeof SAMPLE_LOCATIONS[0]) => {
    onChange({
      lat: location.lat,
      lng: location.lng,
      address: location.name,
    });
    setSearchQuery(location.name);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={value?.address || searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 bg-background"
          />
        </div>
        
        {showSuggestions && searchQuery && filteredLocations.length > 0 && (
          <Card className="absolute z-50 w-full mt-2 p-2 max-h-60 overflow-y-auto shadow-lg animate-fade-in">
            {filteredLocations.map((location, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left mb-1 hover:bg-cloud"
                onClick={() => handleSelectLocation(location)}
              >
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>{location.name}</span>
              </Button>
            ))}
          </Card>
        )}
      </div>
      
      {value && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-cloud rounded-md">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{value.address}</span>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;