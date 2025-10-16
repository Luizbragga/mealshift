import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db, type Food, type Meal } from "@/data/db";
import { hapticSuccess } from "@/lib/haptics";
import { Search } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMeal: Meal;
}

export function AdicionarAlimento({
  open,
  onClose,
  onSuccess,
  defaultMeal,
}: Props) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [qtyStr, setQtyStr] = useState("1");

  const [meal, setMeal] = useState<Meal>(defaultMeal);

  const [freeTextName, setFreeTextName] = useState("");
  const [freeTextKcal, setFreeTextKcal] = useState("");

  const qty = useMemo(() => {
    const v = parseFloat(qtyStr);
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [qtyStr]);

  const filteredFoods = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return foods;
    return foods.filter((f) => f.name.toLowerCase().includes(q));
  }, [foods, searchQuery]);

  useEffect(() => {
    if (!open) return;
    setMeal(defaultMeal);
    void loadFoods();
  }, [open, defaultMeal]);

  async function loadFoods() {
    const allFoods = await db.foods.toArray();
    setFoods(allFoods);
  }

  function resetForm() {
    setSearchQuery("");
    setSelectedFood(null);
    setQtyStr("1");
    setFreeTextName("");
    setFreeTextKcal("");
  }

  async function handleAddFromCatalog() {
    if (!selectedFood || qty <= 0) return;

    const today = new Date().toISOString().split("T")[0];
    const totalKcal = Math.round(selectedFood.kcalPerPortion * qty);

    await db.entries.add({
      dayIso: today,
      meal,
      name: `${selectedFood.name} (${qty}× ${selectedFood.basePortion})`,
      kcal: totalKcal,
      origin: "catalog",
      qty,
    });

    await hapticSuccess();
    onSuccess();
    resetForm();
    onClose();
  }

  async function handleAddFromText() {
    const kcal = parseInt(freeTextKcal, 10);
    if (!freeTextName.trim() || !Number.isFinite(kcal) || kcal <= 0) return;

    const today = new Date().toISOString().split("T")[0];

    await db.entries.add({
      dayIso: today,
      meal,
      name: freeTextName.trim(),
      kcal,
      origin: "text",
    });

    await hapticSuccess();
    onSuccess();
    resetForm();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add food</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Label>Meal</Label>
          <Select value={meal} onValueChange={(v: Meal) => setMeal(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select meal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Snack">Snack</SelectItem>
              <SelectItem value="Dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="catalog">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="catalog">Catalog</TabsTrigger>
            <TabsTrigger value="text">Free text</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search food…"
                aria-label="Search food"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredFoods.map((food) => {
                const isActive = selectedFood?.id === food.id;
                return (
                  <button
                    key={food.id}
                    onClick={() => setSelectedFood(food)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    aria-pressed={isActive}
                    aria-label={`Select ${food.name}`}
                  >
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {food.basePortion} • {food.kcalPerPortion} kcal
                    </div>
                    {isActive && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Selected
                      </div>
                    )}
                  </button>
                );
              })}
              {filteredFoods.length === 0 && (
                <p className="text-sm text-muted-foreground px-1">
                  No results for “{searchQuery}”.
                </p>
              )}
            </div>

            {selectedFood && (
              <>
                <div>
                  <Label>Quantity (multiplier)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    inputMode="decimal"
                    value={qtyStr}
                    onChange={(e) => setQtyStr(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Total:{" "}
                    {Math.round(selectedFood.kcalPerPortion * (qty || 0))} kcal
                  </p>
                </div>

                <Button
                  onClick={handleAddFromCatalog}
                  className="w-full gradient-primary"
                >
                  Add
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div>
              <Label>Description</Label>
              <Input
                placeholder="e.g., Margherita pizza"
                value={freeTextName}
                onChange={(e) => setFreeTextName(e.target.value)}
              />
            </div>

            <div>
              <Label>Calories</Label>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="e.g., 350"
                value={freeTextKcal}
                onChange={(e) => setFreeTextKcal(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAddFromText}
              disabled={!freeTextName.trim() || !parseInt(freeTextKcal || "0")}
              className="w-full gradient-primary"
            >
              Add
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
