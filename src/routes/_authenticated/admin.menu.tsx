import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatBirr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/menu")({ component: MenuAdmin });

type Item = Database["public"]["Tables"]["menu_items"]["Row"];
type Cat = Database["public"]["Tables"]["menu_categories"]["Row"];

function useMenuAdmin() {
  return useQuery({
    queryKey: ["admin-menu"],
    queryFn: async () => {
      const [c, i] = await Promise.all([
        supabase.from("menu_categories").select("*").order("sort_order").order("name"),
        supabase.from("menu_items").select("*").order("sort_order").order("name"),
      ]);
      if (c.error) throw c.error;
      if (i.error) throw i.error;
      const paths = i.data.map((x) => x.image_path).filter((p): p is string => !!p);
      const urls = new Map<string, string>();
      if (paths.length) {
        const { data } = await supabase.storage.from("menu-images").createSignedUrls(paths, 3600);
        data?.forEach((d) => d.path && d.signedUrl && urls.set(d.path, d.signedUrl));
      }
      return { cats: c.data, items: i.data, urls };
    },
  });
}

function MenuAdmin() {
  const qc = useQueryClient();
  const { data } = useMenuAdmin();
  const [editing, setEditing] = useState<Partial<Item> | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [newCat, setNewCat] = useState("");
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-menu"] });
    qc.invalidateQueries({ queryKey: ["menu"] });
  };

  async function patchItem(id: string, patch: Partial<Item>) {
    const { error } = await supabase.from("menu_items").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  }
  async function patchCat(id: string, patch: Partial<Cat>) {
    const { error } = await supabase.from("menu_categories").update(patch).eq("id", id);
    if (error) { toast.error(error.message); return; }
    refresh();
  }

  if (!data) return <p className="text-muted-foreground">Loading…</p>;
  const cats = data.cats.filter((c) => showArchived || !c.archived);
  const items = data.items.filter((i) => showArchived || !i.archived);
  const groups = [...cats, { id: null, name: "No category", archived: false } as unknown as Cat];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">Menu</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground"><Switch checked={showArchived} onCheckedChange={setShowArchived} /> Show archived</label>
          <Button onClick={() => setEditing({ available: true, price: 0, category_id: data.cats[0]?.id ?? null })}><Plus /> New item</Button>
        </div>
      </div>

      <form
        className="mt-6 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newCat.trim()) return;
          const { error } = await supabase.from("menu_categories").insert({ name: newCat.trim(), sort_order: data.cats.length });
          if (error) { toast.error(error.message); return; }
          setNewCat("");
          refresh();
        }}
      >
        <Input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category name (e.g. Hot drinks)" className="max-w-xs" maxLength={60} />
        <Button type="submit" variant="outline">Add category</Button>
      </form>

      {data.items.length === 0 && <p className="mt-10 rounded-md border border-dashed p-8 text-center text-muted-foreground">No menu items yet. Add a category, then your first item.</p>}

      {groups.map((c) => {
        const rows = items.filter((i) => i.category_id === c.id);
        if (c.id === null && rows.length === 0) return null;
        return (
          <section key={c.id ?? "none"} className="mt-8">
            <div className="flex items-center gap-3 border-b pb-2">
              <h2 className={cn("text-xl", c.archived && "text-muted-foreground line-through")}>{c.name}</h2>
              {c.id && (
                <div className="ml-auto flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { const n = prompt("Rename category", c.name); if (n?.trim()) patchCat(c.id, { name: n.trim() }); }}>Rename</Button>
                  <Button size="sm" variant="ghost" onClick={() => patchCat(c.id, { archived: !c.archived })}>{c.archived ? "Restore" : "Archive"}</Button>
                </div>
              )}
            </div>
            <ul className="divide-y">
              {rows.map((i) => (
                <li key={i.id} className={cn("flex items-center gap-4 py-3", i.archived && "opacity-50")}>
                  <div className="size-12 shrink-0 overflow-hidden rounded bg-secondary">
                    {i.image_path && data.urls.get(i.image_path) && <img src={data.urls.get(i.image_path)} alt="" className="size-full object-cover" />}
                  </div>
                  <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(i)}>
                    <p className="font-medium">{i.name} {i.featured && <span className="ml-1 text-xs text-accent-foreground bg-accent/40 rounded px-1.5">Featured</span>}</p>
                    <p className="text-sm text-muted-foreground">{formatBirr(i.price)}</p>
                  </button>
                  <label className="flex items-center gap-2 text-xs">
                    <Switch checked={i.available} onCheckedChange={(v) => patchItem(i.id, { available: v })} />
                    <span className={i.available ? "text-success" : "text-destructive"}>{i.available ? "Available" : "Sold out"}</span>
                  </label>
                </li>
              ))}
              {rows.length === 0 && <li className="py-3 text-sm text-muted-foreground">No items.</li>}
            </ul>
          </section>
        );
      })}

      <ItemDialog item={editing} cats={data.cats.filter((c) => !c.archived)} imageUrl={editing?.image_path ? data.urls.get(editing.image_path) : undefined} onClose={() => setEditing(null)} onSaved={refresh} />
    </div>
  );
}

function ItemDialog({ item, cats, imageUrl, onClose, onSaved }: { item: Partial<Item> | null; cats: Cat[]; imageUrl?: string | undefined; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<Partial<Item>>({});
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastId, setLastId] = useState<string | undefined>("__init");
  if (item && (item.id ?? "new") !== lastId) {
    setLastId(item.id ?? "new");
    setF(item);
    setFile(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name?.trim()) { toast.error("Name is required"); return; }
    setBusy(true);
    try {
      let image_path = f.image_path ?? null;
      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("menu-images").upload(path, file, { contentType: file.type });
        if (error) throw error;
        image_path = path;
      }
      const row = {
        name: f.name.trim(),
        description: f.description ?? "",
        price: Number(f.price) || 0,
        category_id: f.category_id ?? null,
        available: f.available ?? true,
        featured: f.featured ?? false,
        image_path,
      };
      const { error } = f.id ? await supabase.from("menu_items").update(row).eq("id", f.id) : await supabase.from("menu_items").insert(row);
      if (error) throw error;
      toast.success("Saved");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save");
    } finally {
      setBusy(false);
    }
  }

  async function toggleArchive() {
    if (!f.id) return;
    const { error } = await supabase.from("menu_items").update({ archived: !f.archived }).eq("id", f.id);
    if (error) { toast.error(error.message); return; }
    onSaved();
    onClose();
  }

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && (setLastId("__init"), onClose())}>
      <DialogContent className="max-w-lg">
        <DialogTitle className="font-display text-2xl">{f.id ? "Edit item" : "New item"}</DialogTitle>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5"><Label>Name</Label><Input required maxLength={80} value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Price (ETB)</Label><Input required type="number" min={0} step="0.01" value={f.price ?? ""} onChange={(e) => setF({ ...f, price: e.target.value as unknown as number })} /></div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={f.category_id ?? ""} onChange={(e) => setF({ ...f, category_id: e.target.value || null })}>
                <option value="">No category</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5"><Label>Description</Label><Textarea maxLength={400} rows={3} value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="space-y-1.5">
            <Label>Photo</Label>
            <div className="flex items-center gap-3">
              {(file || imageUrl) && <img src={file ? URL.createObjectURL(file) : imageUrl} alt="" className="size-14 rounded object-cover" />}
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm"><Switch checked={f.available ?? true} onCheckedChange={(v) => setF({ ...f, available: v })} /> Available</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={f.featured ?? false} onCheckedChange={(v) => setF({ ...f, featured: v })} /> Featured on home</label>
          </div>
          <div className="flex justify-between gap-2 pt-2">
            {f.id ? <Button type="button" variant="ghost" onClick={toggleArchive}>{f.archived ? "Restore" : "Archive"}</Button> : <span />}
            <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
