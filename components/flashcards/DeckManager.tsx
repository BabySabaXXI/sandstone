"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFlashcardStore } from "@/stores/flashcard-store";
import { Plus, MoreVertical, Edit2, Trash2, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function DeckManager() {
  const { decks, createDeck, deleteDeck, setCurrentDeck, getStudyStats } = useFlashcardStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");

  const handleCreate = () => {
    if (newDeckName.trim()) {
      createDeck(newDeckName.trim(), newDeckDescription.trim());
      setNewDeckName("");
      setNewDeckDescription("");
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 text-[#2D2D2D]">Flashcard Decks</h2>
          <p className="text-[#5A5A5A] mt-1">Create and manage your study decks</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-[#2D2D2D] text-white px-4 py-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Deck
        </button>
      </div>

      {/* Create Deck Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-[#E5E5E0] p-5"
          >
            <input
              type="text"
              placeholder="Deck name..."
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E5E0] rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#E8D5C4]"
            />
            <textarea
              placeholder="Description (optional)..."
              value={newDeckDescription}
              onChange={(e) => setNewDeckDescription(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E5E0] rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-[#E8D5C4] resize-none h-20"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="bg-[#2D2D2D] text-white px-4 py-2 rounded-lg hover:bg-[#1A1A1A] transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="bg-[#F0F0EC] text-[#5A5A5A] px-4 py-2 rounded-lg hover:bg-[#E5E5E0] transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck, index) => {
          const stats = getStudyStats(deck.id);
          const totalCards = deck.cards.length;
          return (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-[#E5E5E0] shadow-card p-5 hover:shadow-card-hover transition-shadow cursor-pointer group"
              onClick={() => setCurrentDeck(deck.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#2D2D2D]" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDeck(deck.id);
                  }}
                  className="text-[#8A8A8A] hover:text-[#D4A8A8] transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-semibold text-[#2D2D2D] mb-1">{deck.name}</h3>
              <p className="text-[#8A8A8A] text-sm mb-4 line-clamp-2">
                {deck.description || "No description"}
              </p>

              {/* Progress Bar */}
              {totalCards > 0 && (
                <div className="h-2 bg-[#F0F0EC] rounded-full mb-4 overflow-hidden flex">
                  <div 
                    className="h-full bg-[#A8C5A8]" 
                    style={{ width: `${(stats.mastered / totalCards) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-[#E5D4A8]" 
                    style={{ width: `${(stats.learning / totalCards) * 100}%` }} 
                  />
                  <div 
                    className="h-full bg-[#A8C5D4]" 
                    style={{ width: `${(stats.new / totalCards) * 100}%` }} 
                  />
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-[#A8C5A8] font-medium">{stats.mastered}</span>
                  <span className="text-[#8A8A8A]">mastered</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#E5D4A8] font-medium">{stats.learning}</span>
                  <span className="text-[#8A8A8A]">learning</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#A8C5D4] font-medium">{stats.new}</span>
                  <span className="text-[#8A8A8A]">new</span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {decks.length === 0 && (
          <div className="col-span-full text-center py-12 text-[#8A8A8A]">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No decks yet. Create your first deck to get started!</p>
            <p className="text-sm">Use flashcards to memorize vocabulary, formulas, and more.</p>
          </div>
        )}
      </div>
    </div>
  );
}
