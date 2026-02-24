"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { Plus, ArrowLeft, Edit2, Trash2, MoreVertical, Play } from "lucide-react";
import { StudyMode } from "./StudyMode";
import { cn } from "@/lib/utils";

interface FlashcardDeckProps {
  deckId: string;
  onBack: () => void;
}

export function FlashcardDeck({ deckId, onBack }: FlashcardDeckProps) {
  const { getDeck, addCard, deleteCard, updateCard, getDueCards, getStudyStats } = useFlashcardStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");

  const deck = getDeck(deckId);
  if (!deck) return null;

  const dueCards = getDueCards(deckId);
  const stats = getStudyStats(deckId);

  const handleAdd = () => {
    if (newFront.trim() && newBack.trim()) {
      addCard(deckId, newFront.trim(), newBack.trim());
      setNewFront("");
      setNewBack("");
      setIsAdding(false);
    }
  };

  const handleEdit = (cardId: string) => {
    const card = deck.cards.find((c) => c.id === cardId);
    if (card) {
      setEditFront(card.front);
      setEditBack(card.back);
      setEditingCard(cardId);
    }
  };

  const handleSaveEdit = () => {
    if (editingCard && editFront.trim() && editBack.trim()) {
      updateCard(deckId, editingCard, { front: editFront.trim(), back: editBack.trim() });
      setEditingCard(null);
      setEditFront("");
      setEditBack("");
    }
  };

  if (isStudying) {
    return <StudyMode deckId={deckId} onExit={() => setIsStudying(false)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#5A5A5A] hover:text-[#2D2D2D] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Decks
        </button>
        <button
          onClick={() => setIsStudying(true)}
          disabled={dueCards.length === 0}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            dueCards.length > 0
              ? "bg-[#2D2D2D] text-white hover:bg-[#1A1A1A]"
              : "bg-[#E5E5E0] text-[#8A8A8A] cursor-not-allowed"
          )}
        >
          <Play className="w-4 h-4" />
          Study ({dueCards.length})
        </button>
      </div>

      {/* Deck Info */}
      <div className="bg-white rounded-xl border border-[#E5E5E0] p-6">
        <h2 className="text-h2 text-[#2D2D2D] mb-2">{deck.name}</h2>
        <p className="text-[#5A5A5A] mb-4">{deck.description || "No description"}</p>
        
        {/* Stats */}
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#A8C5A8]" />
            <span className="text-sm text-[#5A5A5A]">{stats.mastered} Mastered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E5D4A8]" />
            <span className="text-sm text-[#5A5A5A]">{stats.learning} Learning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#A8C5D4]" />
            <span className="text-sm text-[#5A5A5A]">{stats.new} New</span>
          </div>
        </div>
      </div>

      {/* Add Card Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#2D2D2D]">Cards ({deck.cards.length})</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-[#2D2D2D] text-white px-4 py-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>

      {/* Add Card Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-[#E5E5E0] p-5"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#5A5A5A] mb-2">Front</label>
              <textarea
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                placeholder="Question or prompt..."
                className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] resize-none h-24"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#5A5A5A] mb-2">Back</label>
              <textarea
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                placeholder="Answer..."
                className="w-full px-4 py-3 border border-[#E5E5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] resize-none h-24"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="bg-[#2D2D2D] text-white px-4 py-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
              >
                Add Card
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="bg-[#F0F0EC] text-[#5A5A5A] px-4 py-2 rounded-lg hover:bg-[#E5E5E0] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards List */}
      <div className="space-y-3">
        {deck.cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className="bg-white rounded-xl border border-[#E5E5E0] p-5 hover:shadow-card-hover transition-shadow"
          >
            {editingCard === card.id ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">Front</label>
                  <textarea
                    value={editFront}
                    onChange={(e) => setEditFront(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] resize-none h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A5A5A] mb-2">Back</label>
                  <textarea
                    value={editBack}
                    onChange={(e) => setEditBack(e.target.value)}
                    className="w-full px-4 py-2 border border-[#E5E5E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] resize-none h-20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-[#2D2D2D] text-white px-4 py-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingCard(null)}
                    className="bg-[#F0F0EC] text-[#5A5A5A] px-4 py-2 rounded-lg hover:bg-[#E5E5E0] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[#8A8A8A] uppercase tracking-wider">Front</span>
                    <p className="text-[#2D2D2D] mt-1">{card.front}</p>
                  </div>
                  <div>
                    <span className="text-xs text-[#8A8A8A] uppercase tracking-wider">Back</span>
                    <p className="text-[#2D2D2D] mt-1">{card.back}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => handleEdit(card.id)}
                    className="p-2 text-[#8A8A8A] hover:text-[#2D2D2D] transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCard(deckId, card.id)}
                    className="p-2 text-[#8A8A8A] hover:text-[#D4A8A8] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {deck.cards.length === 0 && (
          <div className="text-center py-12 text-[#8A8A8A]">
            <p>No cards yet. Add your first card to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
