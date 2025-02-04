'use client';
import initializeScene from "../../components/render.js"
import React from 'react';

import { useEffect, useRef } from 'react';

const Scene: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [sceneContent, setSceneContent] = React.useState<React.ReactNode>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && mountRef.current) {
            // Call initializeScene and set its return value as the content
            const content = initializeScene(mountRef);
            setSceneContent(content);    // <-- IDE hates this (marks as error) but actually works fine.  Go to localhost:3000/render if it's not showing up
        }
    }, []);

    return (
        <div ref={mountRef} style={{ width: '100vw', height: '100vh' }}>
            {sceneContent}
        </div>
    );
};

export default Scene;