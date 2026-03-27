import { useCallback, useEffect, useRef, useState } from 'react';

export const useGameplayFeedback = () => {
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const blockedMsgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBlocked = useCallback((message: string) => {
    if (blockedMsgTimerRef.current) clearTimeout(blockedMsgTimerRef.current);
    setBlockedMessage(message);
    blockedMsgTimerRef.current = setTimeout(() => setBlockedMessage(null), 1200);
  }, []);

  useEffect(() => () => {
    if (blockedMsgTimerRef.current) clearTimeout(blockedMsgTimerRef.current);
  }, []);

  return { blockedMessage, showBlocked };
};
