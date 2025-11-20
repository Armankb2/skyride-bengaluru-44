import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaxiTier {
  id: string;
  name: string;
  description: string;
  max_passengers: number;
  base_fare: number;
  per_km_rate: number;
  estimated_arrival_minutes: number;
}

interface TierSelectorProps {
  tiers: TaxiTier[];
  selectedTier: TaxiTier | null;
  onSelectTier: (tier: TaxiTier) => void;
  distance: number;
}

const TierSelector = ({ tiers, selectedTier, onSelectTier, distance }: TierSelectorProps) => {
  const calculateFare = (tier: TaxiTier) => {
    return tier.base_fare + tier.per_km_rate * distance;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Select Your Flying Taxi</h3>
      <div className="grid gap-4">
        {tiers.map((tier) => {
          const fare = calculateFare(tier);
          const isSelected = selectedTier?.id === tier.id;
          
          return (
            <Card
              key={tier.id}
              className={cn(
                "relative p-4 cursor-pointer transition-all duration-300 hover:shadow-md",
                isSelected
                  ? "border-primary border-2 bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onSelectTier(tier)}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-lg font-bold text-foreground">{tier.name}</h4>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{tier.max_passengers} passengers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{tier.estimated_arrival_minutes} min arrival</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-primary">
                      ₹{fare.toFixed(0)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      estimated fare
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Final fare may vary slightly based on flight path and conditions
      </p>
    </div>
  );
};

export default TierSelector;