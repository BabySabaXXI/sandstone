// Store Exports
export { useQuizStore } from "./quiz-store";
export { useFlashcardStore } from "./flashcard-store";
export { useDocumentStore } from "./document-store";
export { useEssayStore } from "./essay-store";
export { useLayoutStore } from "./layout-store";
export { useSubjectStore } from "./subject-store";
export { useChatStore } from "./chat-store";

// Selector Exports for better performance
export {
  useQuiz,
  useQuizzesBySubject,
  useQuizAttempts,
  useCurrentQuiz,
} from "./quiz-store";

export {
  useDeck,
  useDecksBySubject,
  useDueCards,
  useCurrentDeck,
  useStudyStats,
} from "./flashcard-store";

export {
  useDocument,
  useDocumentsBySubject,
  useDocumentsInFolder,
  useCurrentDocument,
  useFolder,
  useFoldersBySubject,
} from "./document-store";

export {
  useEssay,
  useEssaysBySubject,
  useEssayStats,
} from "./essay-store";

export {
  useChat,
  useChatsBySubject,
  useCurrentChat,
  useChatMessages,
} from "./chat-store";

export {
  useSidebarOpen,
  useAIPopupOpen,
  useAIPopupPosition,
} from "./layout-store";

export {
  useCurrentSubject,
  useIsEconomics,
  useIsGeography,
} from "./subject-store";

// Type Exports
export type { Essay } from "./essay-store";
export type { Flashcard, FlashcardDeck } from "./flashcard-store";
export type { Chat, ChatMessage } from "./chat-store";

// Store Provider for hydration handling
import { useEffect, useState } from "react";
import { useQuizStore } from "./quiz-store";
import { useFlashcardStore } from "./flashcard-store";
import { useDocumentStore } from "./document-store";
import { useEssayStore } from "./essay-store";
import { useChatStore } from "./chat-store";
import { useLayoutStore } from "./layout-store";
import { useSubjectStore } from "./subject-store";

interface StoreState {
  isHydrated: boolean;
}

// Hook to check if all stores are hydrated
export function useStoresHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);
  
  const quizHydrated = useQuizStore((state: StoreState) => state.isHydrated);
  const flashcardHydrated = useFlashcardStore((state: StoreState) => state.isHydrated);
  const documentHydrated = useDocumentStore((state: StoreState) => state.isHydrated);
  const essayHydrated = useEssayStore((state: StoreState) => state.isHydrated);
  const chatHydrated = useChatStore((state: StoreState) => state.isHydrated);
  const layoutHydrated = useLayoutStore((state: StoreState) => state.isHydrated);
  const subjectHydrated = useSubjectStore((state: StoreState) => state.isHydrated);
  
  useEffect(() => {
    const allHydrated = 
      quizHydrated &&
      flashcardHydrated &&
      documentHydrated &&
      essayHydrated &&
      chatHydrated &&
      layoutHydrated &&
      subjectHydrated;
    
    if (allHydrated) {
      setIsHydrated(true);
    }
  }, [
    quizHydrated,
    flashcardHydrated,
    documentHydrated,
    essayHydrated,
    chatHydrated,
    layoutHydrated,
    subjectHydrated,
  ]);
  
  return isHydrated;
}

// Utility to reset all stores (useful for logout)
export function resetAllStores(): void {
  useQuizStore.persist.clearStorage();
  useFlashcardStore.persist.clearStorage();
  useDocumentStore.persist.clearStorage();
  useEssayStore.persist.clearStorage();
  useChatStore.persist.clearStorage();
  useLayoutStore.persist.clearStorage();
  useSubjectStore.persist.clearStorage();
}

// Utility to sync all stores with Supabase
export async function syncAllStores(): Promise<void> {
  await Promise.all([
    useQuizStore.getState().syncWithSupabase(),
    useFlashcardStore.getState().syncWithSupabase(),
    useDocumentStore.getState().syncWithSupabase(),
    useEssayStore.getState().syncWithSupabase(),
    useChatStore.getState().fetchChats(),
  ]);
}
