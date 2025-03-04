'use client';
import initializeScene from "../../components/render.js"
import React from 'react';

import { useEffect, useRef } from 'react';

const Scene: React.FC = () => {
    const containerRef = useRef(null)

    useEffect(() => {
        if (typeof window !== 'undefined' && containerRef.current) {
            initializeScene(containerRef);
        }
    }, []);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}/>
    );
};

export default Scene;