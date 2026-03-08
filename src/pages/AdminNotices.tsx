import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Pin, Eye, EyeOff, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["New Feature Release", "Maintenance Update", "Platform Announcement", "Security Notice", "Event Update"];
const PRIORITIES = ["normal", "important", "critical"];

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  status: string;
  is_pinned: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const emptyForm = { title: "", content: "", category: "Platform Announcement", priority: "normal", is_pinned: false, expires_at: "" };

const AdminNotices = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdmin();
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!roleLoading && !isAdmin) navigate("/dashboard");
  }, [roleLoading, isAdmin, navigate]);

  const fetchNotices = async () => {
    const { data } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setNotices(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    const payload: any = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      priority: form.priority,
      is_pinned: form.is_pinned,
      expires_at: form.expires_at || null,
    };

    if (editId) {
      const { error } = await supabase.from("notices").update(payload).eq("id", editId);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Notice updated");
    } else {
      payload.created_by = user!.id;
      payload.status = "draft";
      const { error } = await supabase.from("notices").insert(payload);
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Notice created");
    }
    setDialogOpen(false);
    setEditId(null);
    setForm(emptyForm);
    fetchNotices();
  };

  const togglePublish = async (notice: Notice) => {
    const newStatus = notice.status === "published" ? "draft" : "published";
    const update: any = { status: newStatus };
    if (newStatus === "published" && !notice.published_at) update.published_at = new Date().toISOString();
    await supabase.from("notices").update(update).eq("id", notice.id);
    fetchNotices();
    toast.success(newStatus === "published" ? "Published" : "Unpublished");
  };

  const togglePin = async (notice: Notice) => {
    await supabase.from("notices").update({ is_pinned: !notice.is_pinned } as any).eq("id", notice.id);
    fetchNotices();
  };

  const deleteNotice = async (id: string) => {
    await supabase.from("notices").delete().eq("id", id);
    fetchNotices();
    toast.success("Deleted");
  };

  const openEdit = (notice: Notice) => {
    setEditId(notice.id);
    setForm({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      priority: notice.priority,
      is_pinned: notice.is_pinned,
      expires_at: notice.expires_at ? notice.expires_at.split("T")[0] : "",
    });
    setDialogOpen(true);
  };

  const priorityColor = (p: string) => {
    if (p === "critical") return "bg-destructive/10 text-destructive border-destructive/30";
    if (p === "important") return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    return "bg-secondary text-muted-foreground border-border";
  };

  if (roleLoading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-10 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Manage Notices</h1>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm(emptyForm); } }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> New Notice</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editId ? "Edit Notice" : "Create Notice"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Notice title" className="mt-1" />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your announcement..." className="mt-1 min-h-[120px]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PRIORITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Expires at (optional)</Label>
                  <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="mt-1" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_pinned} onCheckedChange={(v) => setForm({ ...form, is_pinned: v })} />
                  <Label>Pin this notice</Label>
                </div>
                <Button onClick={handleSave} className="w-full">{editId ? "Update" : "Create"} Notice</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}</div>
        ) : notices.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No notices yet. Create your first announcement.</div>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "bg-card border rounded-xl p-4 flex items-start justify-between gap-4 transition-colors",
                  n.is_pinned ? "border-primary/30" : "border-border/50"
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {n.is_pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
                    <h3 className="font-semibold text-foreground text-sm">{n.title}</h3>
                    <Badge variant="outline" className={cn("text-[10px]", priorityColor(n.priority))}>{n.priority}</Badge>
                    <Badge variant="outline" className="text-[10px]">{n.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{n.category} · {new Date(n.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(n)}>
                    {n.status === "published" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePin(n)}>
                    <Pin className={cn("h-3.5 w-3.5", n.is_pinned && "text-primary")} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(n)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteNotice(n.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotices;
