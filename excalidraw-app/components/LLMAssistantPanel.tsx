import React, { useState, useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { fetchLLMAssistantResponse } from '../llm/api';
import type { ExcalidrawElement, ExcalidrawImperativeAPI, AppState } from '@excalidraw/excalidraw/types';

// Define atoms
export const llmChatHistoryAtom = atom<{ role: string; content: string }[]>([]);
export const llmIsLoadingAtom = atom(false);
export const llmAssistantPanelOpenAtom = atom(false); // For controlling visibility

interface LLMAssistantPanelProps {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}

export const LLMAssistantPanel: React.FC<LLMAssistantPanelProps> = ({ excalidrawAPI }) => {
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useAtom(llmChatHistoryAtom);
  const [isLoading, setIsLoading] = useAtom(llmIsLoadingAtom);
  const [isOpen, setIsOpen] = useAtom(llmAssistantPanelOpenAtom);

  // Effect to clear chat history if panel is closed and reopened, for example
  // Or could persist history in localStorage using jotai-persist
  useEffect(() => {
    if (isOpen) {
      // Optional: Load history from storage or reset
    }
  }, [isOpen]);

  const handleSendPrompt = async () => {
    if (!prompt.trim() || !excalidrawAPI) {
      return;
    }

    const currentPrompt = prompt;
    setPrompt("");
    setIsLoading(true);
    const userMessage = { role: "user", content: currentPrompt };
    // Optimistically update chat history
    setChatHistory((prev) => [...prev, userMessage]);

    const sceneElements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const selectedElements = Object.values(appState.selectedElementIds)
      .map(id => sceneElements.find(el => el.id === id))
      .filter(el => !!el) as ExcalidrawElement[];

    const response = await fetchLLMAssistantResponse({
      prompt: currentPrompt,
      sceneElements,
      selectedElements,
      // Send a limited history to avoid overly large requests
      chatHistory: chatHistory.slice(-10).filter(msg => msg.role !== 'error'),
    });

    setIsLoading(false);

    if (response.error) {
      setChatHistory((prev) => [...prev, { role: "error", content: response.error! }]);
    } else {
      if (response.textResponse) {
        setChatHistory((prev) => [...prev, { role: "assistant", content: response.textResponse! }]);
      }

      let sceneChanged = false;
      const currentElements = excalidrawAPI.getSceneElements();
      let nextElements = [...currentElements];

      if (response.modifiedElements && response.modifiedElements.length > 0) {
        response.modifiedElements.forEach(mod => {
          const index = nextElements.findIndex(el => el.id === mod.id);
          if (index !== -1) {
            nextElements[index] = { ...nextElements[index], ...mod.updates, versionNonce: nextElements[index].versionNonce + 1 };
            sceneChanged = true;
          }
        });
      }

      if (response.newElements && response.newElements.length > 0) {
        // Basic check for ID clashes, though backend should ensure unique IDs
        const newElementsToAdd = response.newElements.filter(
          newEl => !nextElements.some(existingEl => existingEl.id === newEl.id)
        );
        nextElements.push(...newElementsToAdd);
        if (newElementsToAdd.length > 0) {
            sceneChanged = true;
        }
      }

      if (sceneChanged) {
        excalidrawAPI.updateScene({
          elements: nextElements,
          commitToHistory: true,
        });
      }
    }
  };

  if (!isOpen || !excalidrawAPI) {
    return null;
  }

  return (
    <div
      className="llm-assistant-panel"
      style={{
        position: "fixed",
        right: "20px",
        top: "70px",
        width: "320px",
        background: "var(--sidebar-bg-color)", // Use Excalidraw variables if possible
        color: "var(--text-primary-color)",
        border: "1px solid var(--button-gray-border)",
        borderRadius: "var(--space-sm)",
        padding: "10px",
        zIndex: 1000, // Ensure it's above other elements
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '60vh'
      }}
    >
      <div
        className="chat-history"
        style={{
          flexGrow: 1,
          overflowY: "auto",
          marginBottom: "10px",
          borderBottom: "1px solid var(--button-gray-border)",
          paddingBottom: "10px"
        }}
      >
        {chatHistory.map((msg, index) => (
          <div key={index} className={`chat-message chat-message--${msg.role}`} style={{ marginBottom: '8px', fontSize: '0.85em' }}>
            <strong style={{ textTransform: 'capitalize' }}>{msg.role}: </strong>
            <span style={{ whiteSpace: 'pre-wrap'}}>{msg.content}</span>
          </div>
        ))}
        {isLoading && (
          <div className="chat-message chat-message--assistant" style={{ marginBottom: '8px', fontSize: '0.85em' }}>
            <strong>Assistant: </strong>
            <em>Thinking...</em>
          </div>
        )}
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Ask the AI assistant..."
        rows={3}
        style={{
          width: "100%",
          boxSizing: "border-box",
          marginBottom: "5px",
          borderRadius: "var(--input-radius)",
          border: "1px solid var(--button-gray-border)",
          padding: "8px",
          backgroundColor: "var(--input-bg-color)",
          color: "var(--text-primary-color)",
        }}
        disabled={isLoading}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendPrompt();
          }
        }}
      />
      <button
        onClick={handleSendPrompt}
        disabled={isLoading || !prompt.trim()}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "var(--button-primary-bg)",
          color: "var(--button-primary-color)",
          border: "none",
          borderRadius: "var(--input-radius)",
          cursor: "pointer"
        }}
      >
        Send
      </button>
    </div>
  );
};
