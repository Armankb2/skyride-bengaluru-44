-- Create taxi tiers table
CREATE TABLE public.taxi_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  max_passengers INTEGER NOT NULL,
  base_fare DECIMAL(10, 2) NOT NULL,
  per_km_rate DECIMAL(10, 2) NOT NULL,
  estimated_arrival_minutes INTEGER NOT NULL,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id TEXT NOT NULL UNIQUE,
  tier_id UUID NOT NULL REFERENCES public.taxi_tiers(id),
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(10, 8) NOT NULL,
  pickup_address TEXT NOT NULL,
  destination_latitude DECIMAL(10, 8) NOT NULL,
  destination_longitude DECIMAL(10, 8) NOT NULL,
  destination_address TEXT NOT NULL,
  distance_km DECIMAL(10, 2) NOT NULL,
  estimated_fare DECIMAL(10, 2) NOT NULL,
  final_fare DECIMAL(10, 2),
  estimated_travel_minutes INTEGER NOT NULL,
  pickup_time_start TIMESTAMP WITH TIME ZONE,
  pickup_time_end TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'searching',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.taxi_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (MVP without auth)
CREATE POLICY "Allow public read access to taxi tiers"
ON public.taxi_tiers
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert bookings"
ON public.bookings
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public read own bookings"
ON public.bookings
FOR SELECT
USING (true);

CREATE POLICY "Allow public update bookings"
ON public.bookings
FOR UPDATE
USING (true);

CREATE POLICY "Allow public insert feedback"
ON public.feedback
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public read feedback"
ON public.feedback
FOR SELECT
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_created_at ON public.bookings(created_at DESC);
CREATE INDEX idx_bookings_booking_id ON public.bookings(booking_id);
CREATE INDEX idx_feedback_booking_id ON public.feedback(booking_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial taxi tier data
INSERT INTO public.taxi_tiers (name, description, max_passengers, base_fare, per_km_rate, estimated_arrival_minutes, display_order) VALUES
('Eco', 'Affordable option with basic comfort', 2, 500.00, 80.00, 12, 1),
('Comfort', 'Balanced comfort and pricing', 3, 800.00, 120.00, 10, 2),
('Elite', 'Premium experience with luxury seating', 4, 1500.00, 200.00, 8, 3);