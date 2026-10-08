import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { getAdminMenu, saveMenuItem, toggleArchiveMenuItem, saveMenuCategory } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatBirr } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/menu")({ component: MenuAdmin });

type Item = {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  available: boolean;
  featured: boolean;
  image_path: string | null;
  sort_order: number;
  archived: boolean;
};

type Cat = {
  id: string;
  name: string;
  sort_order: number;
  archived: boolean;
};

function MenuAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-menu"],
    queryFn: () => getAdminMenu(),
  });
  const [editing, setEditing] = useState<Partial<Item> | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [newCat, setNewCat] = useState("");
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-menu"] });
    qc.invalidateQueries({ queryKey: ["menu"] });
  };

  async function patchItem(id: string, patch: Partial<Item>) {
    try {
      await saveMenuItem({ data: { id, ...patch } });
      refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update item");
    }
  }

  if (!data) return <p className="text-muted-foreground">Loading…</p>;
  const cats = (data.cats as Cat[]).filter((c) => showArchived || !c.archived);
  const items = (data.items as Item[]).filter((i) => showArchived || !i.archived);
  const groups = [...cats, { id: null, name: "No category", archived: false, sort_order: 999 } as unknown as Cat];

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Menu</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch checked={showArchived} onCheckedChange={setShowArchived} /> Show archived
          </label>
          <Button onClick={() => setEditing({ available: true, price: 0, category_id: cats[0]?.id ?? null })}>
            <Plus /> New item
          </Button>
        </div>
      </div>

      <form
        className="mt-6 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!newCat.trim()) return;
          try {
            await saveMenuCategory({ data: { name: newCat.trim(), sort_order: cats.length } });
            setNewCat("");
            refresh();
          } catch (err: any) {
            toast.error(err.message || "Failed to add category");
          }
        }}
      >
        <Input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="New category name (e.g. Hot drinks)"
          className="max-w-xs"
          maxLength={60}
        />
        <Button type="submit" variant="outline">Add category</Button>
      </form>

      {items.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
          No menu items yet. Add a category, then your first item.
        </p>
      )}

      {groups.map((c) => {
        const rows = items.filter((i) => i.category_id === c.id);
        if (c.id === null && rows.length === 0) return null;
        return (
          <section key={c.id ?? "none"} className="mt-8">
            <div className="flex items-center gap-3 border-b border-border/60 pb-2">
              <h2 className={cn("text-xl font-semibold", c.archived && "text-muted-foreground line-through")}>
                {c.name}
              </h2>
            </div>
            <ul className="divide-y divide-border/50">
              {rows.map((i) => (
                <li key={i.id} className={cn("flex items-center gap-4 py-3", i.archived && "opacity-50")}>
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-secondary/60 p-1 flex items-center justify-center">
                    {i.image_path && <img src={i.image_path} alt="" className="size-full object-contain" />}
                  </div>
                  <button type="button" className="min-w-0 flex-1 text-left cursor-pointer" onClick={() => setEditing(i)}>
                    <p className="font-semibold text-foreground">
                      {i.name}{" "}
                      {i.featured && (
                        <span className="ml-1 text-xs text-accent bg-accent/15 rounded-full px-2 py-0.5 font-semibold">
                          Featured
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatBirr(i.price)}</p>
                  </button>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <Switch checked={i.available} onCheckedChange={(v) => patchItem(i.id, { available: v })} />
                    <span className={i.available ? "text-success font-medium" : "text-destructive font-medium"}>
                      {i.available ? "Available" : "Sold out"}
                    </span>
                  </label>
                </li>
              ))}
              {rows.length === 0 && <li className="py-3 text-sm text-muted-foreground">No items.</li>}
            </ul>
          </section>
        );
      })}

      <ItemDialog
        item={editing}
        cats={cats}
        onClose={() => setEditing(null)}
        onSaved={refresh}
      />
    </div>
  );
}

function ItemDialog({
  item,
  cats,
  onClose,
  onSaved,
}: {
  item: Partial<Item> | null;
  cats: Cat[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [f, setF] = useState<Partial<Item>>({});
  const [busy, setBusy] = useState(false);
  const [lastId, setLastId] = useState<string | undefined>("__init");

  if (item && (item.id ?? "new") !== lastId) {
    setLastId(item.id ?? "new");
    setF(item);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name?.trim()) { toast.error("Name is required"); return; }
    setBusy(true);
    try {
      await saveMenuItem({
        data: {
          id: f.id,
          name: f.name.trim(),
          description: f.description ?? "",
          price: Number(f.price) || 0,
          category_id: f.category_id ?? null,
          available: f.available ?? true,
          featured: f.featured ?? false,
          image_path: f.image_path ?? null,
        },
      });
      toast.success("Saved");
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save item");
    } finally {
      setBusy(false);
    }
  }

  async function toggleArchive() {
    if (!f.id) return;
    try {
      await toggleArchiveMenuItem({ data: { id: f.id, archived: !f.archived } });
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to archive item");
    }
  }

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && (setLastId("__init"), onClose())}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogTitle className="font-sans text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {f.id ? "Edit item" : "New item"}
        </DialogTitle>
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input required value={f.name ?? ""} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Price (ETB)</Label>
              <Input type="number" min={0} step={1} required value={f.price ?? 0} onChange={(e) => setF({ ...f, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={f.category_id ?? ""}
                onChange={(e) => setF({ ...f, category_id: e.target.value || null })}
              >
                <option value="">No category</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={2} value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Image URL (optional)</Label>
            <Input placeholder="https://..." value={f.image_path ?? ""} onChange={(e) => setF({ ...f, image_path: e.target.value })} />
          </div>
          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Switch checked={f.available ?? true} onCheckedChange={(v) => setF({ ...f, available: v })} /> Available
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Switch checked={f.featured ?? false} onCheckedChange={(v) => setF({ ...f, featured: v })} /> Featured
            </label>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            {f.id ? (
              <Button type="button" variant="outline" className="text-destructive" onClick={toggleArchive}>
                {f.archived ? "Restore" : "Archive"}
              </Button>
            ) : <span />}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
