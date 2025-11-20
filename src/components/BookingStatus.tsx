import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plane, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MapPin,
  Navigation,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Booking {
  id: string;
  booking_id: string;
  pickup_address: string;
  destination_address: string;
  distance_km: number;
  estimated_fare: number;
  final_fare: number | null;
  estimated_travel_minutes: number;
  pickup_time_start: string | null;
  pickup_time_end: string | null;
  status: string;
  created_at: string;
  tier: {
    name: string;
  };
}

interface BookingStatusProps {
  booking: Booking;
  onFeedback?: () => void;
  onViewDetails?: () => void;
}

const statusConfig = {
  searching: {
    icon: Clock,
    label: 'Searching',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    description: 'Finding the nearest available taxi',
  },
  assigned: {
    icon: CheckCircle,
    label: 'Assigned',
    color: 'text-success',
    bgColor: 'bg-success/10',
    description: 'Taxi has been assigned to your booking',
  },
  en_route: {
    icon: Plane,
    label: 'En Route',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    description: 'Taxi is on the way to your pickup location',
  },
  arriving: {
    icon: MapPin,
    label: 'Arriving',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    description: 'Taxi will arrive in a few minutes',
  },
  in_flight: {
    icon: Plane,
    label: 'In Flight',
    color: 'text-sky',
    bgColor: 'bg-sky/10',
    description: 'Your journey is in progress',
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    color: 'text-success',
    bgColor: 'bg-success/10',
    description: 'Journey completed successfully',
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    description: 'Booking has been cancelled',
  },
};

const BookingStatus = ({ booking, onFeedback, onViewDetails }: BookingStatusProps) => {
  const config = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.searching;
  const Icon = config.icon;
  
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';
  const isActive = !isCompleted && !isCancelled;

  return (
    <Card className="p-6 space-y-4 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Booking ID: {booking.booking_id}
          </h3>
          <p className="text-sm text-muted-foreground">
            {new Date(booking.created_at).toLocaleString()}
          </p>
        </div>
        
        <Badge className={cn(config.bgColor, config.color, "flex items-center gap-1 px-3 py-1")}>
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      </div>

      {isActive && (
        <div className={cn("p-4 rounded-lg flex items-start gap-3", config.bgColor)}>
          <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.color)} />
          <div>
            <p className="text-sm font-medium text-foreground">{config.description}</p>
            {booking.pickup_time_start && booking.pickup_time_end && (
              <p className="text-xs text-muted-foreground mt-1">
                Expected arrival: {new Date(booking.pickup_time_start).toLocaleTimeString()} - {new Date(booking.pickup_time_end).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-start gap-3 p-3 bg-cloud rounded-lg">
          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pickup</p>
            <p className="text-sm font-medium text-foreground">{booking.pickup_address}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-cloud rounded-lg">
          <Navigation className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Destination</p>
            <p className="text-sm font-medium text-foreground">{booking.destination_address}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Distance</p>
          <p className="text-sm font-semibold text-foreground">{booking.distance_km.toFixed(1)} km</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Fare</p>
          <p className="text-sm font-semibold text-primary">
            ₹{(booking.final_fare || booking.estimated_fare).toFixed(0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Tier</p>
          <p className="text-sm font-semibold text-foreground">{booking.tier.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Travel Time</p>
          <p className="text-sm font-semibold text-foreground">{booking.estimated_travel_minutes} min</p>
        </div>
      </div>

      {isCompleted && onFeedback && (
        <div className="pt-3 border-t border-border">
          <Button
            onClick={onFeedback}
            className="w-full bg-gradient-sky"
          >
            Share Feedback
          </Button>
        </div>
      )}
      
      {isCancelled && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-xs text-destructive">
            This booking was cancelled. If you have any questions, please contact support.
          </p>
        </div>
      )}
    </Card>
  );
};

export default BookingStatus;