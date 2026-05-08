import { useCallback, useEffect, useState } from "react";

export type EditorToastTone = "success" | "info" | "error";

export type EditorToast = {
  message: string;
  tone: EditorToastTone;
};

const editorToastDurations: Record<EditorToastTone, number> = {
  success: 3000,
  info: 3000,
  error: 5000,
};

export function useEditorToast() {
  const [toast, setToast] = useState<EditorToast | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, editorToastDurations[toast.tone]);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  const showToast = useCallback((nextToast: EditorToast) => {
    setToast(nextToast);
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    clearToast,
  };
}
