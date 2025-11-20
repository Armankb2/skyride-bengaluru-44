import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Users, Clock, DollarSign } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface TaxiTier {
  id: string;
  name: string;
  description: string;
  max_passengers: number;
  base_fare: number;
  per_km_rate: number;
  estimated_arrival_minutes: number;
}

interface BookingSummaryProps {
  pickupLocation: Location;
  destinationLocation: Location;
  selectedTier: TaxiTier;
  distance: number;
  estimatedFare: number;
  estimatedTravelMinutes: number;
  onConfirm: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const BookingSummary = ({
  pickupLocation,
  destinationLocation,
  selectedTier,
  distance,
  estimatedFare,
  estimatedTravelMinutes,
  onConfirm,
  onBack,
  isLoading = false,
}: BookingSummaryProps) => {
  return (
    <Card className="p-6 space-y-6 shadow-lg">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Booking Summary</h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-cloud rounded-lg">
            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Pickup Location</p>
              <p className="text-sm font-medium text-foreground">{pickupLocation.address}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-cloud rounded-lg">
            <Navigation className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Destination</p>
              <p className="text-sm font-medium text-foreground">{destinationLocation.address}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="bg-primary/5 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Taxi Tier</span>
              <span className="text-sm font-semibold text-foreground">{selectedTier.name}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Distance
              </span>
              <span className="text-sm font-semibold text-foreground">{distance.toFixed(1)} km</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Travel Time
              </span>
              <span className="text-sm font-semibold text-foreground">{estimatedTravelMinutes} min</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Arrival Time
              </span>
              <span className="text-sm font-semibold text-foreground">{selectedTier.estimated_arrival_minutes} min</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Capacity
              </span>
              <span className="text-sm font-semibold text-foreground">{selectedTier.max_passengers} passengers</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Estimated Fare</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">₹{estimatedFare.toFixed(0)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Final fare may vary slightly
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1"
          disabled={isLoading}
        >
          Edit
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-1 bg-gradient-sky"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
              Confirming...
            </>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        By confirming, you agree to be ready at your rooftop or designated pickup area
      </p>
    </Card>
  );
};

export default BookingSummary;