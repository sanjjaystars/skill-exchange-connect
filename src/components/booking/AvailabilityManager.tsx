import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return [`${h}:00`, `${h}:30`];
}).flat();

interface Slot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

const AvailabilityManager = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDay, setNewDay] = useState("1");
  const [newStart, setNewStart] = useState("17:00");
  const [newEnd, setNewEnd] = useState("19:00");
  const [adding, setAdding] = useState(false);

  const fetchSlots = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("user_id", user.id)
      .order("day_of_week")
      .order("start_time");
    if (!error) setSlots((data ?? []) as Slot[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

  const addSlot = async () => {
    if (!user) return;
    setAdding(true);
    const { error } = await supabase.from("availability_slots").insert({
      user_id: user.id,
      day_of_week: parseInt(newDay),
      start_time: newStart,
      end_time: newEnd,
    });
    if (error) {
      toast.error("Failed to add slot");
    } else {
      toast.success("Availability added");
      fetchSlots();
    }
    setAdding(false);
  };

  const removeSlot = async (id: string) => {
    const { error } = await supabase.from("availability_slots").delete().eq("id", id);
    if (!error) {
      setSlots(s => s.filter(slot => slot.id !== id));
      toast.success("Slot removed");
    }
  };

  const grouped = DAYS.map((day, i) => ({
    day,
    dayIndex: i,
    slots: slots.filter(s => s.day_of_week === i),
  })).filter(g => g.slots.length > 0);

  return (
    <div className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-bold">Your Availability</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {grouped.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No availability set. Add your available time slots below.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {grouped.map(({ day, slots: daySlots }) => (
                <div key={day}>
                  <p className="text-xs font-medium text-muted-foreground mb-1">{day}</p>
                  <div className="space-y-1">
                    {daySlots.map(slot => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/60"
                      >
                        <span className="text-sm font-medium">
                          {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                        </span>
                        <button
                          onClick={() => removeSlot(slot.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border/40 pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Add a time slot</p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Select value={newDay} onValueChange={setNewDay}>
                <SelectTrigger className="bg-secondary border-border text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d, i) => (
                    <SelectItem key={i} value={i.toString()}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newStart} onValueChange={setNewStart}>
                <SelectTrigger className="bg-secondary border-border text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={newEnd} onValueChange={setNewEnd}>
                <SelectTrigger className="bg-secondary border-border text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addSlot} disabled={adding} size="sm" className="w-full rounded-full">
              <Plus className="h-3.5 w-3.5 mr-1" />
              {adding ? "Adding..." : "Add Slot"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AvailabilityManager;
