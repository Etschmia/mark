import React, { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import ReactGA from 'react-ga4';
import { isVercel } from '../utils/environment';

// Placeholder for GA4 Measurement ID. 
// In a real scenario, this should be an environment variable.
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';

export const WebAnalytics: React.FC = () => {
    useEffect(() => {
        // Initialize GA4 only if we are NOT on Vercel (Self-hosted / Localhost)
        if (!isVercel()) {
            try {
                ReactGA.initialize(GA_MEASUREMENT_ID);
                // Send initial page view
                ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
            } catch (error) {
                console.error("GA4 Initialization Error:", error);
            }
        }
    }, []);

    // Render Vercel Analytics if on Vercel
    if (isVercel()) {
        return <Analytics />;
    }

    // Render nothing (or potentially a debug indicator) for self-hosted
    return null;
};
