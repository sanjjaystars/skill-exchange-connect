import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface AvailSlot {
  start_time: string;
  end_time: string;
}

interface BookingModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  partnerId: string;
  partnerName: string;
  connections: { user_id: string; name: string }[];
  onBooked: () => void;
}

const BookingModal = ({ open, onOpenChange, partnerId, partnerName, connections, onBooked }: BookingModalProps) => {
  const { user } = useAuth();
  const [selectedPartner, setSelectedPartner] = useState(partnerId);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<AvailSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [skill, setSkill] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    setSelectedPartner(partnerId);
  }, [partnerId]);

  // Fetch partner availability when date is selected
  useEffect(() => {
    if (!selectedDate || !selectedPartner) {
      setAvailableSlots([]);
      return;
    }
    const fetchAvailability = async () => {
      setLoadingSlots(true);
      const dayOfWeek = selectedDate.getDay();
      const { data, error } = await supabase
        .from("availability_slots")
        .select("start_time, end_time")
        .eq("user_id", selectedPartner)
        .eq("day_of_week", dayOfWeek)
        .order("start_time");
      if (!error) setAvailableSlots((data ?? []) as AvailSlot[]);
      setLoadingSlots(false);
    };
    fetchAvailability();
  }, [selectedDate, selectedPartner]);

  const handleBook = async () => {
    if (!user || !selectedDate || !selectedSlot || !selectedPartner) return;
    setBooking(true);

    const [startTime, endTime] = selectedSlot.split("-");
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    // Check for conflicts
    const { data: hasConflict } = await supabase.rpc("check_booking_conflict", {
      p_user_id: user.id,
      p_date: dateStr,
      p_start: startTime,
      p_end: endTime,
    });

    if (hasConflict) {
      toast.error("You already have a session booked at this time!");
      setBooking(false);
      return;
    }

    const { error } = await supabase.from("sessions").insert({
      teacher_id: selectedPartner,
      learner_id: user.id,
      skill: skill.trim() || "General",
      status: "pending",
      scheduled_date: dateStr,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: 60,
      notes: notes.trim(),
    });

    if (error) {
      toast.error("Failed to book session");
    } else {
      toast.success(`Session booked with ${partnerName || "partner"}!`);
      onOpenChange(false);
      onBooked();
      // Reset
      setSelectedDate(undefined);
      setSelectedSlot("");
      setSkill("");
      setNotes("");
    }
    setBooking(false);
  };

  const resolvedName = partnerName || connections.find(c => c.user_id === selectedPartner)?.name || "Partner";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Book a Session</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Partner select */}
          {!partnerId && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Partner</label>
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue placeholder="Select a connection" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map(c => (
                    <SelectItem key={c.user_id} value={c.user_id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {partnerId && (
            <div className="px-3 py-2 rounded-lg bg-secondary/60 text-sm">
              Booking with <span className="font-semibold">{resolvedName}</span>
            </div>
          )}

          {/* Skill */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Skill</label>
            <Input
              value={skill}
              onChange={e => setSkill(e.target.value)}
              placeholder="e.g., Python, UI Design"
              className="bg-secondary border-border"
            />
          </div>

          {/* Date picker */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-secondary border-border",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Available slots */}
          {selectedDate && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Available Slots ({DAYS[selectedDate.getDay()]})
              </label>
              {loadingSlots ? (
                <div className="flex justify-center py-3">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  No availability set for {DAYS[selectedDate.getDay()]}. The partner hasn't configured slots for this day.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableSlots.map(slot => {
                    const key = `${slot.start_time}-${slot.end_time}`;
                    const isSelected = selectedSlot === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedSlot(key)}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-150",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary/60 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        <Clock className="h-3 w-3 inline mr-1.5" />
                        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Notes (optional)</label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Anything you'd like to discuss..."
              className="bg-secondary border-border resize-none"
              rows={2}
            />
          </div>

          <Button
            onClick={handleBook}
            disabled={!selectedPartner || !selectedDate || !selectedSlot || booking}
            className="w-full rounded-full"
          >
            {booking ? "Booking..." : "Book Session"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
