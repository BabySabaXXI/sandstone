"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Swipeable,
  Draggable,
  SwipeableItem,
  MagneticButton,
  TiltCard,
  LongPressButton,
} from "@/components/animations";
import {
  Trash2,
  Edit,
  GripVertical,
  Heart,
  Share2,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";

// ============================================
// Swipeable Cards Example
// ============================================

interface SwipeableCardsExampleProps {
  items: Array<{ id: string; title: string; description: string }>;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

/**
 * SwipeableCardsExample - Cards with swipe-to-reveal actions
 * 
 * @example
 * ```tsx
 * <SwipeableCardsExample
 *   items={cards}
 *   onDelete={(id) => deleteCard(id)}
 *   onEdit={(id) => editCard(id)}
 * />
 * ```
 */
export function SwipeableCardsExample({
  items,
  onDelete,
  onEdit,
}: SwipeableCardsExampleProps) {
  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2 }}
          >
            <SwipeableItem
              onDelete={() => onDelete(item.id)}
              onEdit={() => onEdit(item.id)}
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            </SwipeableItem>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Draggable Grid Example
// ============================================

interface DraggableGridExampleProps {
  items: Array<{ id: string; color: string; label: string }>;
}

/**
 * DraggableGridExample - Grid of draggable items
 * 
 * @example
 * ```tsx
 * <DraggableGridExample items={colors} />
 * ```
 */
export function DraggableGridExample({ items }: DraggableGridExampleProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);

  return (
    <div className="relative h-64 bg-muted/30 rounded-lg p-4">
      <p className="text-sm text-muted-foreground mb-4">
        Drag the items around (they snap back)
      </p>
      <div className="flex flex-wrap gap-4">
        {items.map((item) => (
          <Draggable
            key={item.id}
            snapToOrigin
            onDragStart={() => setActiveItem(item.id)}
            onDragEnd={() => setActiveItem(null)}
          >
            <motion.div
              className={`
                w-20 h-20 rounded-lg flex items-center justify-center
                cursor-grab active:cursor-grabbing shadow-lg
                ${activeItem === item.id ? "ring-2 ring-primary ring-offset-2" : ""}
              `}
              style={{ backgroundColor: item.color }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-medium text-sm">{item.label}</span>
            </motion.div>
          </Draggable>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Magnetic Buttons Example
// ============================================

/**
 * MagneticButtonsExample - Buttons that follow cursor
 * 
 * @example
 * ```tsx
 * <MagneticButtonsExample />
 * ```
 */
export function MagneticButtonsExample() {
  return (
    <div className="flex flex-wrap gap-6 items-center justify-center p-8">
      <MagneticButton
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
        strength={0.4}
        onClick={() => toast.success("Magnetic button clicked!")}
      >
        Strong Magnet
      </MagneticButton>

      <MagneticButton
        className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium"
        strength={0.2}
        onClick={() => toast.success("Gentle magnet clicked!")}
      >
        Gentle Magnet
      </MagneticButton>

      <MagneticButton
        className="w-14 h-14 bg-rose-500 text-white rounded-full flex items-center justify-center"
        strength={0.5}
        onClick={() => toast.success("Heart clicked!")}
      >
        <Heart className="w-6 h-6" />
      </MagneticButton>
    </div>
  );
}

// ============================================
// Tilt Cards Example
// ============================================

const sampleCards = [
  {
    id: "1",
    title: "Economics",
    description: "Supply, demand, and market equilibrium",
    icon: "📈",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "2",
    title: "Geography",
    description: "Physical and human geography concepts",
    icon: "🌍",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "3",
    title: "History",
    description: "Key historical events and analysis",
    icon: "📜",
    color: "from-amber-500 to-orange-500",
  },
];

/**
 * TiltCardsExample - Cards that tilt based on mouse position
 * 
 * @example
 * ```tsx
 * <TiltCardsExample />
 * ```
 */
export function TiltCardsExample() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {sampleCards.map((card) => (
        <TiltCard key={card.id} maxTilt={15} scale={1.02}>
          <Card className="overflow-hidden cursor-pointer group">
            <div
              className={`h-24 bg-gradient-to-br ${card.color} flex items-center justify-center text-4xl`}
            >
              {card.icon}
            </div>
            <CardContent className="p-4">
              <h4 className="font-semibold group-hover:text-primary transition-colors">
                {card.title}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        </TiltCard>
      ))}
    </div>
  );
}

// ============================================
// Long Press Example
// ============================================

/**
 * LongPressExample - Buttons with long press action
 * 
 * @example
 * ```tsx
 * <LongPressExample />
 * ```
 */
export function LongPressExample() {
  const [longPressCount, setLongPressCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center gap-4">
        <LongPressButton
          onLongPress={() => {
            setLongPressCount((c) => c + 1);
            toast.success("Long press detected!");
          }}
          onClick={() => setClickCount((c) => c + 1)}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium relative overflow-hidden"
          duration={800}
        >
          Hold me (800ms)
        </LongPressButton>

        <div className="text-sm text-muted-foreground">
          <p>Long presses: {longPressCount}</p>
          <p>Clicks: {clickCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LongPressButton
          onLongPress={() => toast.success("Saved to bookmarks!")}
          className="w-12 h-12 bg-muted rounded-full flex items-center justify-center"
          duration={500}
        >
          <Bookmark className="w-5 h-5" />
        </LongPressButton>

        <LongPressButton
          onLongPress={() => toast.success("Shared!")}
          className="w-12 h-12 bg-muted rounded-full flex items-center justify-center"
          duration={500}
        >
          <Share2 className="w-5 h-5" />
        </LongPressButton>

        <span className="text-sm text-muted-foreground">
          Long press icons for quick actions
        </span>
      </div>
    </div>
  );
}

// ============================================
// Swipe Detection Example
// ============================================

/**
 * SwipeDetectionExample - Detects swipe gestures
 * 
 * @example
 * ```tsx
 * <SwipeDetectionExample />
 * ```
 */
export function SwipeDetectionExample() {
  const [lastSwipe, setLastSwipe] = useState<string | null>(null);
  const [swipeCount, setSwipeCount] = useState(0);

  const handleSwipe = (direction: string) => {
    setLastSwipe(direction);
    setSwipeCount((c) => c + 1);
    toast.info(`Swiped ${direction}!`);
  };

  return (
    <div className="space-y-4">
      <Swipeable
        onSwipeLeft={() => handleSwipe("left")}
        onSwipeRight={() => handleSwipe("right")}
        onSwipeUp={() => handleSwipe("up")}
        onSwipeDown={() => handleSwipe("down")}
        threshold={30}
      >
        <Card className="cursor-grab active:cursor-grabbing">
          <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px]">
            <motion.div
              className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <MoreHorizontal className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="text-center font-medium">Swipe me in any direction!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try swiping left, right, up, or down
            </p>
          </CardContent>
        </Card>
      </Swipeable>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Total swipes: {swipeCount}
        </span>
        {lastSwipe && (
          <motion.span
            key={lastSwipe}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-primary font-medium"
          >
            Last: {lastSwipe}
          </motion.span>
        )}
      </div>
    </div>
  );
}

// ============================================
// Gesture Showcase (Combined)
// ============================================

/**
 * GestureShowcase - All gesture examples combined
 * 
 * @example
 * ```tsx
 * <GestureShowcase />
 * ```
 */
export function GestureShowcase() {
  const [swipeItems, setSwipeItems] = useState([
    { id: "1", title: "Item 1", description: "Swipe to edit or delete" },
    { id: "2", title: "Item 2", description: "Try swiping left and right" },
    { id: "3", title: "Item 3", description: "Smooth gesture handling" },
  ]);

  const colors = [
    { id: "1", color: "#3b82f6", label: "Blue" },
    { id: "2", color: "#10b981", label: "Green" },
    { id: "3", color: "#f59e0b", label: "Amber" },
    { id: "4", color: "#ef4444", label: "Red" },
  ];

  return (
    <div className="space-y-8">
      {/* Swipeable Cards */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Swipeable Cards</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Swipe left to delete, right to edit
        </p>
        <SwipeableCardsExample
          items={swipeItems}
          onDelete={(id) => {
            setSwipeItems((items) => items.filter((item) => item.id !== id));
            toast.success("Item deleted");
          }}
          onEdit={(id) => {
            toast.info(`Edit item ${id}`);
          }}
        />
      </section>

      {/* Draggable Items */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Draggable Items</h3>
        <DraggableGridExample items={colors} />
      </section>

      {/* Magnetic Buttons */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Magnetic Buttons</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Buttons that follow your cursor
        </p>
        <MagneticButtonsExample />
      </section>

      {/* Tilt Cards */}
      <section>
        <h3 className="text-lg font-semibold mb-4">3D Tilt Cards</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Hover over cards to see the tilt effect
        </p>
        <TiltCardsExample />
      </section>

      {/* Long Press */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Long Press Actions</h3>
        <LongPressExample />
      </section>

      {/* Swipe Detection */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Swipe Detection</h3>
        <SwipeDetectionExample />
      </section>
    </div>
  );
}
