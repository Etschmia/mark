import React, { useState, useEffect } from 'react';
import { Modal } from './common/Modal';
import { BuildInfo } from '../types';

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ExtendedBuildInfo extends BuildInfo {
    viteVersion?: string;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
    const [buildInfo, setBuildInfo] = useState<ExtendedBuildInfo | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Load build info
            fetch('/build-info.json')
                .then(response => response.json())
                .then(data => setBuildInfo(data))
                .catch(error => {
                    console.warn('Could not load build info:', error);
                    setBuildInfo({
                        buildDate: 'Unknown',
                        buildTimestamp: 0,
                        version: '1.0.0',
                        viteVersion: 'Unknown'
                    });
                });
        }
    }, [isOpen]);

    // Body overflow handling
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const formatBuildDate = (dateString: string) => {
        if (!dateString || dateString === 'Unknown') return 'Unknown';
        try {
            const date = new Date(dateString);
            const formatted = date.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            });
            return formatted;
        } catch {
            return dateString;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="About" maxWidth="md">
            <div className="p-6">
                    <div className="space-y-6">
                        {/* App Info */}
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-white mb-2">Markdown Editor Pro</h3>
                            <p className="text-slate-300 text-lg">A powerful, privacy-focused Markdown editor</p>
                        </div>

                        {/* Build Information */}
                        <div className="bg-slate-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-white mb-3">Build Information</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Version:</span>
                                    <span className="text-slate-200 font-mono">{buildInfo?.version || 'Loading...'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Build Date:</span>
                                    <span className="text-slate-200 font-mono">
                                        {buildInfo ? formatBuildDate(buildInfo.buildDate) : 'Loading...'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Vite Version:</span>
                                    <span className="text-slate-200 font-mono">{buildInfo?.viteVersion || 'Loading...'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="bg-slate-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-white mb-3">Copyright</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Copyright © 2025, Tobias Brendler<br />
                                All rights reserved.
                            </p>
                        </div>

                        {/* Links */}
                        <div className="bg-slate-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-white mb-3">Links</h4>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-slate-400 text-sm block mb-1">Homepage:</span>
                                    <a
                                        href="https://github.com/Etschmia/mark"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-400 hover:text-cyan-300 transition-colors duration-150 text-sm break-all"
                                    >
                                        https://github.com/Etschmia/mark
                                    </a>
                                </div>
                                <div>
                                    <span className="text-slate-400 text-sm block mb-1">Support the Developer:</span>
                                    <a
                                        href="https://paypal.me/Etschmia"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-150 text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.9.9 0 0 0-.89.8l-1.12 7.106a.564.564 0 0 0 .556.65h4.606a.75.75 0 0 0 .741-.66l.69-4.37a.564.564 0 0 1 .556-.49h1.638c3.85 0 6.87-1.567 7.75-6.09.382-1.97.072-3.61-.591-4.86z" />
                                        </svg>
                                        paypal.me/Etschmia
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                
                {/* Footer */}
                <div className="border-t border-slate-700 p-4 text-center">
                    <p className="text-slate-400 text-sm">
                        Press <kbd className="px-1 py-0.5 bg-slate-600 rounded text-xs">Esc</kbd> to close
                    </p>
                </div>
            </div>
        </Modal>
    );
};
