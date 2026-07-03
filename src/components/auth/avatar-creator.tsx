
"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const SUBDOMAIN = process.env.NEXT_PUBLIC_READY_PLAYER_ME_SUBDOMAIN;

interface AvatarCreatorProps {
  onAvatarExported: (url: string) => void;
}

export function AvatarCreator({ onAvatarExported }: AvatarCreatorProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }
      
      try {
        const json = JSON.parse(event.data);
         if (json?.source !== 'readyplayerme') {
          return;
        }
        // Susbcribe to all events sent from Ready Player Me
        // once frame is ready
        if (json.eventName === 'v1.frame.ready') {
          if(iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage(
                  JSON.stringify({
                  target: 'readyplayerme',
                  type: 'subscribe',
                  eventName: 'v1.**'
                  }),
                  '*'
              );
          }
        }
        // Get avatar GLB URL
        if (json.eventName === 'v1.avatar.exported') {
          onAvatarExported(json.data.url);
        }
      } catch (error) {
          console.error("Failed to parse JSON from Ready Player Me", error);
          return;
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onAvatarExported]);
  
  const handleLoad = () => {
    setIsLoaded(true);
  };
  
  return (
    <div className="w-full aspect-[9/16] max-h-[70vh] border-2 border-primary/30 rounded-lg relative bg-muted overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p>Cargando Creador de Avatar...</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={`https://nexusapp-c0a21.readyplayer.me/avatar?frameApi`}
        className="w-full h-full border-0"
        allow="camera *; microphone *"
        onLoad={handleLoad}
      ></iframe>
    </div>
  );
}
