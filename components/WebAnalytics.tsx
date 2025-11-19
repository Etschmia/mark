import React, { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import ReactGA from 'react-ga4';
import { isVercel } from '../utils/environment';

// Read GA Measurement ID from environment variables (must start with VITE_)
// This will be undefined on Vercel if not set, which is fine as we check isVercel()
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const WebAnalytics: React.FC = () => {
    useEffect(() => {
        // Initialize GA4 only if we are NOT on Vercel (Self-hosted / Localhost)
        // and if the Measurement ID is available.
        if (!isVercel() && GA_MEASUREMENT_ID) {
            try {
                ReactGA.initialize(GA_MEASUREMENT_ID);
                // Send initial page view
                ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
            } catch (error) {
                console.error("GA4 Initialization Error:", error);
            }
        } else if (!isVercel() && !GA_MEASUREMENT_ID) {
            console.warn("Web Analytics: VITE_GA_MEASUREMENT_ID is not set in .env");
        }
    }, []);

    // Render Vercel Analytics if on Vercel
    if (isVercel()) {
        return <Analytics />;
    }

    // Render nothing (or potentially a debug indicator) for self-hosted
    return null;
};
