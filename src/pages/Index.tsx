import { useState, useEffect } from 'react';
import { Plane, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MapComponent from '@/components/MapComponent';
import LocationSearch from '@/components/LocationSearch';
import TierSelector from '@/components/TierSelector';
import BookingSummary from '@/components/BookingSummary';
import BookingStatus from '@/components/BookingStatus';
import FeedbackModal from '@/components/FeedbackModal';

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

type BookingStep = 'location' | 'tier' | 'summary' | 'confirmed';

const Index = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<BookingStep>('location');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [tiers, setTiers] = useState<TaxiTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<TaxiTier | null>(null);
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (loc1: Location, loc2: Location): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.lat * Math.PI) / 180) *
        Math.cos((loc2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch taxi tiers
  useEffect(() => {
    const fetchTiers = async () => {
      const { data, error } = await supabase
        .from('taxi_tiers')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to load taxi tiers',
          variant: 'destructive',
        });
        return;
      }

      setTiers(data || []);
    };

    fetchTiers();
  }, [toast]);

  // Fetch recent bookings
  useEffect(() => {
    const fetchRecentBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tier:taxi_tiers(name)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }

      setRecentBookings(data || []);
    };

    fetchRecentBookings();
  }, [currentBooking]);

  const handleContinue = () => {
    if (!pickupLocation || !destinationLocation) {
      toast({
        title: 'Missing Information',
        description: 'Please select both pickup and destination locations',
        variant: 'destructive',
      });
      return;
    }

    const distance = calculateDistance(pickupLocation, destinationLocation);
    
    // Validate distance (Bengaluru boundaries check simplified)
    if (distance < 1) {
      toast({
        title: 'Distance Too Short',
        description: 'Pickup and destination must be at least 1 km apart',
        variant: 'destructive',
      });
      return;
    }

    if (distance > 50) {
      toast({
        title: 'Distance Too Long',
        description: 'We currently serve routes within 50 km in Bengaluru',
        variant: 'destructive',
      });
      return;
    }

    setCurrentStep('tier');
  };

  const handleTierSelected = () => {
    if (!selectedTier) return;
    setCurrentStep('summary');
  };

  const handleConfirmBooking = async () => {
    if (!pickupLocation || !destinationLocation || !selectedTier) return;

    setIsLoading(true);

    const distance = calculateDistance(pickupLocation, destinationLocation);
    const estimatedFare = selectedTier.base_fare + selectedTier.per_km_rate * distance;
    const estimatedTravelMinutes = Math.ceil((distance / 3) * 60); // Assuming 3 km/min average speed
    const bookingId = `SR${Date.now().toString().slice(-8)}`;

    const pickupTimeStart = new Date(Date.now() + selectedTier.estimated_arrival_minutes * 60000);
    const pickupTimeEnd = new Date(pickupTimeStart.getTime() + 300000); // 5 min window

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        booking_id: bookingId,
        tier_id: selectedTier.id,
        pickup_latitude: pickupLocation.lat,
        pickup_longitude: pickupLocation.lng,
        pickup_address: pickupLocation.address,
        destination_latitude: destinationLocation.lat,
        destination_longitude: destinationLocation.lng,
        destination_address: destinationLocation.address,
        distance_km: distance,
        estimated_fare: estimatedFare,
        estimated_travel_minutes: estimatedTravelMinutes,
        pickup_time_start: pickupTimeStart.toISOString(),
        pickup_time_end: pickupTimeEnd.toISOString(),
        status: 'searching',
      })
      .select(`
        *,
        tier:taxi_tiers(name)
      `)
      .single();

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Booking Failed',
        description: 'Unable to create booking. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setCurrentBooking(data);
    setCurrentStep('confirmed');

    toast({
      title: 'Booking Confirmed!',
      description: `Your booking ID is ${bookingId}`,
    });

    // Simulate status updates for demo
    setTimeout(async () => {
      await supabase
        .from('bookings')
        .update({ status: 'assigned' })
        .eq('id', data.id);
      
      setCurrentBooking((prev: any) => ({ ...prev, status: 'assigned' }));
    }, 5000);
  };

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (!currentBooking) return;

    const { error } = await supabase.from('feedback').insert({
      booking_id: currentBooking.id,
      rating,
      comment: comment || null,
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Thank You!',
      description: 'Your feedback helps us improve',
    });

    setShowFeedback(false);
  };

  const handleStartNewBooking = () => {
    setPickupLocation(null);
    setDestinationLocation(null);
    setSelectedTier(null);
    setCurrentBooking(null);
    setCurrentStep('location');
  };

  const distance = pickupLocation && destinationLocation 
    ? calculateDistance(pickupLocation, destinationLocation)
    : 0;

  const estimatedFare = selectedTier 
    ? selectedTier.base_fare + selectedTier.per_km_rate * distance
    : 0;

  const estimatedTravelMinutes = Math.ceil((distance / 3) * 60);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-sky text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <Plane className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SkyRide</h1>
              <p className="text-sm text-primary-foreground/80">Flying Taxis in Bengaluru</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {currentStep !== 'confirmed' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Map Section */}
              <div className="space-y-4">
                <MapComponent
                  pickupLocation={pickupLocation}
                  destinationLocation={destinationLocation}
                />
                
                {distance > 0 && (
                  <Card className="p-4 bg-primary/5 border-primary">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Flight Distance</span>
                      <span className="text-lg font-bold text-primary">{distance.toFixed(1)} km</span>
                    </div>
                  </Card>
                )}
              </div>

              {/* Booking Form Section */}
              <div className="space-y-6">
                {currentStep === 'location' && (
                  <Card className="p-6 space-y-6 shadow-lg">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">Book Your Flight</h2>
                      <p className="text-sm text-muted-foreground">
                        Select your pickup and destination to get started
                      </p>
                    </div>

                    <LocationSearch
                      label="Pickup Location"
                      placeholder="Search for a location..."
                      value={pickupLocation}
                      onChange={setPickupLocation}
                      type="pickup"
                    />

                    <LocationSearch
                      label="Destination"
                      placeholder="Search for a location..."
                      value={destinationLocation}
                      onChange={setDestinationLocation}
                      type="destination"
                    />

                    <Button
                      onClick={handleContinue}
                      disabled={!pickupLocation || !destinationLocation}
                      className="w-full bg-gradient-sky"
                    >
                      Continue
                    </Button>
                  </Card>
                )}

                {currentStep === 'tier' && (
                  <Card className="p-6 space-y-6 shadow-lg">
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentStep('location')}
                      className="mb-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>

                    <TierSelector
                      tiers={tiers}
                      selectedTier={selectedTier}
                      onSelectTier={setSelectedTier}
                      distance={distance}
                    />

                    <Button
                      onClick={handleTierSelected}
                      disabled={!selectedTier}
                      className="w-full bg-gradient-sky"
                    >
                      Continue to Summary
                    </Button>
                  </Card>
                )}

                {currentStep === 'summary' && pickupLocation && destinationLocation && selectedTier && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => setCurrentStep('tier')}
                      className="mb-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>

                    <BookingSummary
                      pickupLocation={pickupLocation}
                      destinationLocation={destinationLocation}
                      selectedTier={selectedTier}
                      distance={distance}
                      estimatedFare={estimatedFare}
                      estimatedTravelMinutes={estimatedTravelMinutes}
                      onConfirm={handleConfirmBooking}
                      onBack={() => setCurrentStep('tier')}
                      isLoading={isLoading}
                    />
                  </>
                )}

                {/* Recent Bookings */}
                {recentBookings.length > 0 && currentStep === 'location' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">Recent Bookings</h3>
                    {recentBookings.slice(0, 2).map((booking) => (
                      <Card key={booking.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-foreground">
                            {booking.booking_id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.pickup_address} → {booking.destination_address}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              <BookingStatus
                booking={currentBooking}
                onFeedback={() => setShowFeedback(true)}
              />
              
              <Button
                onClick={handleStartNewBooking}
                className="w-full bg-gradient-sky"
              >
                Book Another Flight
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedbackSubmit}
        bookingId={currentBooking?.booking_id || ''}
      />
    </div>
  );
};

export default Index;