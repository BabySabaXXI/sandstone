"use client";

import { memo, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFlashcardStore, type Flashcard } from "@/stores/flashcard-store-enhanced";
import { Flashcard as FlashcardComponent } from "./Flashcard";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  RotateCcw,
  Brain,
  Settings,
  Pause,
  Play,
  SkipForward,
  BarChart3,
  Flame,
  Target,
  Zap,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDefaultStudyModeConfig, type StudyMode, type StudyModeConfig } from "@/lib/flashcards/sm2-enhanced";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// ============================================================================
// TYPES
// ============================================================================

interface StudyModeProps {
  deckId: string;
  onExit: () => void;
  initialMode?: StudyMode;
}

interface SessionStats {
  correct: number;
  total: number;
  startTime: number;
  pausedTime: number;
  isPaused: boolean;
}

// ============================================================================
// STUDY MODE SELECTOR
// ============================================================================

const STUDY_MODES: { mode: StudyMode; label: string; description: string; icon: React.ElementType }[] = [
  {
    mode: "standard",
    label: "Standard",
    description: "Review all due cards in order",
    icon: BookOpen,
  },
  {
    mode: "cram",
    label: "Cram",
    description: "Focus on difficult cards with shuffling",
    icon: Zap,
  },
  {
    mode: "review",
    label: "Review",
    description: "Only review cards you already know",
    icon: RotateCcw,
  },
  {
    mode: "learn",
    label: "Learn",
    description: "Focus on new cards only",
    icon: Brain,
  },
];

interface StudyModeSelectorProps {
  selectedMode: StudyMode;
  onSelect: (mode: StudyMode) => void;
  disabled?: boolean;
}

const StudyModeSelector = memo(function StudyModeSelector({
  selectedMode,
  onSelect,
  disabled,
}: StudyModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {STUDY_MODES.map(({ mode, label, description, icon: Icon }) => (
        <button
          key={mode}
          onClick={() => onSelect(mode)}
          disabled={disabled}
          className={cn(
            "flex flex-col items-center p-4 rounded-xl border-2 transition-all",
            "hover:scale-[1.02] active:scale-[0.98]",
            selectedMode === mode
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Icon className={cn(
            "w-8 h-8 mb-2",
            selectedMode === mode ? "text-primary" : "text-muted-foreground"
          )} />
          <span className="font-semibold">{label}</span>
          <span className="text-xs text-muted-foreground text-center mt-1">
            {description}
          </span>
        </button>
      ))}
    </div>
  );
});

// ============================================================================
// SESSION CONFIGURATION
// ============================================================================

interface SessionConfigProps {
  config: StudyModeConfig;
  onChange: (config: StudyModeConfig) => void;
}

const SessionConfig = memo(function SessionConfig({ config, onChange }: SessionConfigProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Card Limit (0 = unlimited)</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[config.cardLimit || 0]}
            onValueChange={([value]) => onChange({ ...config, cardLimit: value || undefined })}
            max={100}
            step={5}
            className="flex-1"
          />
          <span className="w-12 text-right font-mono">{config.cardLimit || 0}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Include Cards</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">New cards</span>
            <Switch
              checked={config.includeNew !== false}
              onCheckedChange={(checked) => onChange({ ...config, includeNew: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Review cards</span>
            <Switch
              checked={config.includeReview !== false}
              onCheckedChange={(checked) => onChange({ ...config, includeReview: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Learning cards</span>
            <Switch
              checked={config.includeLearning !== false}
              onCheckedChange={(checked) => onChange({ ...config, includeLearning: checked })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Options</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Shuffle cards</span>
            <Switch
              checked={config.shuffle === true}
              onCheckedChange={(checked) => onChange({ ...config, shuffle: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Focus on weak cards</span>
            <Switch
              checked={config.focusOnWeak === true}
              onCheckedChange={(checked) => onChange({ ...config, focusOnWeak: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// STUDY COMPLETE SCREEN
// ============================================================================

interface StudyCompleteProps {
  total: number;
  correct: number;
  timeSpent: number;
  onRestart: () => void;
  onExit: () => void;
  onChangeMode: () => void;
}

const StudyComplete = memo(function StudyComplete({
  total,
  correct,
  timeSpent,
  onRestart,
  onExit,
  onChangeMode,
}: StudyCompleteProps) {
  const accuracy = useMemo(
    () => (total > 0 ? Math.round((correct / total) * 100) : 0),
    [total, correct]
  );

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getAccuracyMessage = () => {
    if (accuracy >= 90) return "Outstanding! 🌟";
    if (accuracy >= 80) return "Great job! 🎉";
    if (accuracy >= 70) return "Good work! 👍";
    if (accuracy >= 60) return "Keep practicing! 💪";
    return "Don't give up! 📚";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12 max-w-md mx-auto"
    >
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mx-auto mb-6">
        <Brain className="w-12 h-12 text-primary-foreground" />
      </div>
      
      <h3 className="text-2xl font-bold mb-2">Session Complete!</h3>
      <p className="text-muted-foreground mb-6">{getAccuracyMessage()}</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-xl border p-4">
          <div className={cn(
            "text-3xl font-bold",
            accuracy >= 80 ? "text-green-500" : accuracy >= 60 ? "text-yellow-500" : "text-red-500"
          )}>
            {accuracy}%
          </div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="text-3xl font-bold">{total}</div>
          <div className="text-sm text-muted-foreground">Cards Reviewed</div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="text-3xl font-bold text-green-500">{correct}</div>
          <div className="text-sm text-muted-foreground">Correct</div>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <div className="text-3xl font-bold">{formatTime(timeSpent)}</div>
          <div className="text-sm text-muted-foreground">Time Spent</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRestart}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Study Again
          </Button>
          <Button
            variant="outline"
            onClick={onChangeMode}
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            Change Mode
          </Button>
        </div>
        <Button onClick={onExit} className="w-full">
          Back to Decks
        </Button>
      </div>
    </motion.div>
  );
});

// ============================================================================
// ALL CAUGHT UP SCREEN
// ============================================================================

interface AllCaughtUpProps {
  onExit: () => void;
  onStudyAll: () => void;
}

const AllCaughtUp = memo(function AllCaughtUp({ onExit, onStudyAll }: AllCaughtUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      <h3 className="text-2xl font-bold mb-2">All Caught Up!</h3>
      <p className="text-muted-foreground mb-6">
        No cards due for review right now.
      </p>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onExit}>
          Back to Decks
        </Button>
        <Button onClick={onStudyAll}>
          Study All Cards
        </Button>
      </div>
    </motion.div>
  );
});

// ============================================================================
// STUDY HEADER
// ============================================================================

interface StudyHeaderProps {
  currentIndex: number;
  totalCards: number;
  correctCount: number;
  timeSpent: number;
  isPaused: boolean;
  onExit: () => void;
  onPause: () => void;
  onSkip: () => void;
}

const StudyHeader = memo(function StudyHeader({
  currentIndex,
  totalCards,
  correctCount,
  timeSpent,
  isPaused,
  onExit,
  onPause,
  onSkip,
}: StudyHeaderProps) {
  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Exit
        </Button>
      </div>

      <div className="flex items-center gap-4">
        {/* Progress */}
        <div className="flex items-center gap-2 text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <Target className="w-4 h-4" />
          <span className="text-sm font-medium">
            {currentIndex + 1} / {totalCards}
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{formatTime(timeSpent)}</span>
        </div>

        {/* Correct Count */}
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{correctCount}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onPause}>
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onSkip}>
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// PROGRESS BAR
// ============================================================================

interface ProgressBarProps {
  progress: number;
  className?: string;
}

const ProgressBar = memo(function ProgressBar({ progress, className }: ProgressBarProps) {
  return (
    <div className={cn("h-2 bg-muted rounded-full overflow-hidden", className)}>
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
});

// ============================================================================
// MAIN STUDY MODE COMPONENT
// ============================================================================

export const StudyMode = memo(function StudyMode({
  deckId,
  onExit,
  initialMode = "standard",
}: StudyModeProps) {
  const { 
    getDeck, 
    startStudySession, 
    endStudySession, 
    getNextCard, 
    reviewCard, 
    skipCard,
    getSessionProgress,
    setStudyMode,
  } = useFlashcardStore();

  // State
  const [selectedMode, setSelectedMode] = useState<StudyMode>(initialMode);
  const [config, setConfig] = useState<StudyModeConfig>(getDefaultStudyModeConfig(initialMode));
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    correct: 0,
    total: 0,
    startTime: Date.now(),
    pausedTime: 0,
    isPaused: false,
  });
  const [showConfig, setShowConfig] = useState(false);

  const pauseStartTime = useRef<number | null>(null);

  // Get deck
  const deck = useMemo(() => getDeck(deckId), [deckId, getDeck]);

  // Get current card
  const currentCard = useMemo(() => {
    if (!hasStarted || isComplete) return null;
    return getNextCard();
  }, [hasStarted, isComplete, getNextCard]);

  // Get session progress
  const progress = useMemo(() => {
    const sessionProgress = getSessionProgress();
    return sessionProgress.total > 0
      ? (sessionProgress.current / sessionProgress.total) * 100
      : 0;
  }, [getSessionProgress, currentCard]);

  // Set study mode on mount
  useEffect(() => {
    setStudyMode(selectedMode);
    return () => setStudyMode(null);
  }, [selectedMode, setStudyMode]);

  // Timer effect
  useEffect(() => {
    if (sessionStats.isPaused || isComplete) return;

    const interval = setInterval(() => {
      // Timer is passive, we calculate on render
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStats.isPaused, isComplete]);

  // Calculate elapsed time
  const elapsedTime = useMemo(() => {
    if (sessionStats.isPaused) {
      return sessionStats.pausedTime;
    }
    return Date.now() - sessionStats.startTime;
  }, [sessionStats, Date.now()]);

  // Handlers
  const handleStart = useCallback(() => {
    const success = startStudySession(deckId, selectedMode, config);
    if (success) {
      setHasStarted(true);
      setSessionStats({
        correct: 0,
        total: 0,
        startTime: Date.now(),
        pausedTime: 0,
        isPaused: false,
      });
    }
  }, [deckId, selectedMode, config, startStudySession]);

  const handleRate = useCallback(
    async (quality: number, timeSpent: number) => {
      if (!currentCard) return;

      await reviewCard(currentCard.id, quality, timeSpent);

      setSessionStats((prev) => ({
        ...prev,
        correct: prev.correct + (quality >= 3 ? 1 : 0),
        total: prev.total + 1,
      }));

      // Check if session is complete
      const sessionProgress = getSessionProgress();
      if (sessionProgress.current >= sessionProgress.total) {
        const session = endStudySession();
        if (session) {
          setIsComplete(true);
        }
      }
    },
    [currentCard, reviewCard, endStudySession, getSessionProgress]
  );

  const handleSkip = useCallback(() => {
    skipCard();
    const sessionProgress = getSessionProgress();
    if (sessionProgress.current >= sessionProgress.total) {
      const session = endStudySession();
      if (session) {
        setIsComplete(true);
      }
    }
  }, [skipCard, endStudySession, getSessionProgress]);

  const handlePause = useCallback(() => {
    setSessionStats((prev) => {
      if (prev.isPaused) {
        // Resume
        const pausedDuration = Date.now() - (pauseStartTime.current || Date.now());
        return {
          ...prev,
          isPaused: false,
          pausedTime: prev.pausedTime + pausedDuration,
        };
      } else {
        // Pause
        pauseStartTime.current = Date.now();
        return { ...prev, isPaused: true };
      }
    });
  }, []);

  const handleRestart = useCallback(() => {
    setIsComplete(false);
    setHasStarted(false);
    handleStart();
  }, [handleStart]);

  const handleChangeMode = useCallback(() => {
    setIsComplete(false);
    setHasStarted(false);
  }, []);

  const handleStudyAll = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      includeNew: true,
      includeReview: true,
      includeLearning: true,
    }));
    handleStart();
  }, [handleStart]);

  // Early returns
  if (!deck) return null;

  // Mode selection screen
  if (!hasStarted && !isComplete) {
    return (
      <div className="max-w-lg mx-auto py-8">
        <h2 className="text-2xl font-bold text-center mb-2">Choose Study Mode</h2>
        <p className="text-muted-foreground text-center mb-6">
          Select how you want to study today
        </p>

        <StudyModeSelector
          selectedMode={selectedMode}
          onSelect={setSelectedMode}
        />

        <div className="mt-6 flex gap-3">
          <Dialog open={showConfig} onOpenChange={setShowConfig}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Session Configuration</DialogTitle>
              </DialogHeader>
              <SessionConfig config={config} onChange={setConfig} />
            </DialogContent>
          </Dialog>
          <Button onClick={handleStart} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            Start Studying
          </Button>
        </div>

        <Button variant="ghost" onClick={onExit} className="w-full mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Deck
        </Button>
      </div>
    );
  }

  // All caught up screen
  if (hasStarted && !currentCard && !isComplete) {
    return <AllCaughtUp onExit={onExit} onStudyAll={handleStudyAll} />;
  }

  // Study complete screen
  if (isComplete) {
    return (
      <StudyComplete
        total={sessionStats.total}
        correct={sessionStats.correct}
        timeSpent={elapsedTime}
        onRestart={handleRestart}
        onExit={onExit}
        onChangeMode={handleChangeMode}
      />
    );
  }

  // Study session
  const sessionProgress = getSessionProgress();

  return (
    <div className="max-w-3xl mx-auto">
      <StudyHeader
        currentIndex={sessionProgress.current - 1}
        totalCards={sessionProgress.total}
        correctCount={sessionStats.correct}
        timeSpent={elapsedTime}
        isPaused={sessionStats.isPaused}
        onExit={onExit}
        onPause={handlePause}
        onSkip={handleSkip}
      />

      <ProgressBar progress={progress} className="mb-8" />

      {/* Pause Overlay */}
      <AnimatePresence>
        {sessionStats.isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={handlePause}
          >
            <div className="text-center">
              <Pause className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold">Paused</h3>
              <p className="text-muted-foreground">Click anywhere to resume</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card */}
      <AnimatePresence mode="wait">
        {currentCard && (
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <FlashcardComponent
              id={currentCard.id}
              front={currentCard.front}
              back={currentCard.back}
              interval={currentCard.interval}
              repetitionCount={currentCard.repetitionCount}
              easeFactor={currentCard.easeFactor}
              onRate={handleRate}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default StudyMode;
