import { useState, useEffect } from "react";
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
import { db, Food } from "@/data/db";
import { hapticSuccess } from "@/lib/haptics";
import { Search } from "lucide-react";

type meal = "Breakfast" | "Lunch" | "Snack" | "Dinner";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultmeal: meal;
}

export function AdicionarAlimento({
  open,
  onClose,
  onSuccess,
  defaultmeal,
}: Props) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [qty, setQty] = useState("1");
  const [meal, setmeal] = useState<meal>(defaultmeal);

  // Free text
  const [Textname, setTextname] = useState("");
  const [TextKcal, setTextKcal] = useState("");

  useEffect(() => {
    if (open) {
      void loadFoods();
      setmeal(defaultmeal);
    }
  }, [open, defaultmeal]);

  const loadFoods = async () => {
    const allFoods = await db.foods.toArray();
    setFoods(allFoods);
  };

  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCatalog = async () => {
    if (!selectedFood || !qty) return;

    const today = new Date().toISOString().split("T")[0];
    const totalKcal = selectedFood.kcalPerPortion * parseFloat(qty);

    await db.entries.add({
      dayIso: today,
      meal,
      name: `${selectedFood.name} (${qty}x ${selectedFood.basePortion})`,
      kcal: Math.round(totalKcal),
      origin: "catalog",
      qty: parseFloat(qty),
    });

    await hapticSuccess();
    onSuccess();
    onClose();
    resetForm();
  };

  const handleAddText = async () => {
    if (!Textname || !TextKcal) return;

    const today = new Date().toISOString().split("T")[0];

    await db.entries.add({
      dayIso: today,
      meal,
      name: Textname,
      kcal: parseInt(TextKcal),
      origin: "text",
    });

    await hapticSuccess();
    onSuccess();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSearchQuery("");
    setSelectedFood(null);
    setQty("1");
    setTextname("");
    setTextKcal("");
  };

  const mealLabel = (r: meal) =>
    ((
      {
        Breakfast: "Breakfast",
        Lunch: "Lunch",
        Snack: "Snack",
        Dinner: "Dinner",
      } as const
    )[r]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add food</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Label>Meal</Label>
          <Select value={meal} onValueChange={(v: any) => setmeal(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select meal" />
            </SelectTrigger>
            <SelectContent>
              {/* Values remain in PT for DB compatibility; labels in EN */}
              <SelectItem value="Breakfast">Breakfast</SelectItem>
              <SelectItem value="Lunch">Lunch</SelectItem>
              <SelectItem value="Snack">Snack</SelectItem>
              <SelectItem value="Dinner">Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="Catalog">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="Catalog">Catalog</TabsTrigger>
            <TabsTrigger value="Text">Free text</TabsTrigger>
          </TabsList>

          <TabsContent value="Catalog" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search food…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => setSelectedFood(food)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedFood?.id === food.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium">{food.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {food.basePortion} • {food.kcalPerPortion} kcal
                  </div>
                  {selectedFood?.id === food.id && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Selected
                    </div>
                  )}
                </button>
              ))}
            </div>

            {selectedFood && (
              <>
                <div>
                  <Label>Quantity (multiplier)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Total:{" "}
                    {Math.round(
                      selectedFood.kcalPerPortion * parseFloat(qty || "0")
                    )}{" "}
                    kcal
                  </p>
                </div>

                <Button
                  onClick={handleAddCatalog}
                  className="w-full gradient-primary"
                >
                  Add
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="Text" className="space-y-4">
            <div>
              <Label>Description</Label>
              <Input
                placeholder="e.g., Margherita pizza"
                value={Textname}
                onChange={(e) => setTextname(e.target.value)}
              />
            </div>

            <div>
              <Label>Calories</Label>
              <Input
                type="number"
                placeholder="e.g., 350"
                value={TextKcal}
                onChange={(e) => setTextKcal(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAddText}
              disabled={!Textname || !TextKcal}
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
