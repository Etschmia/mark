import React from 'react';
import { Modal } from './common/Modal';
import { BuildInfo } from '../types';

interface ExtendedBuildInfo extends BuildInfo {
    viteVersion?: string;
}

interface UpdateInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: 'success' | 'fail' | 'unchanged';
    buildInfo?: ExtendedBuildInfo | null;
}

export const UpdateInfoModal: React.FC<UpdateInfoModalProps> = ({ 
    isOpen, 
    onClose, 
    status, 
    buildInfo 
}) => {
    // Body overflow handling
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }
    }, [isOpen]);

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

    const getStatusConfig = () => {
        switch (status) {
            case 'success':
                return {
                    title: 'Success',
                    icon: '✅',
                    color: 'text-green-400',
                    bgColor: 'bg-green-900/20',
                    borderColor: 'border-green-500/30',
                    message: 'The application has been successfully updated to the latest version.'
                };
            case 'fail':
                return {
                    title: 'Fail',
                    icon: '❌',
                    color: 'text-red-400',
                    bgColor: 'bg-red-900/20',
                    borderColor: 'border-red-500/30',
                    message: 'The server could not be reached. Please check your internet connection and try again later.'
                };
            case 'unchanged':
                return {
                    title: 'Unchanged',
                    icon: 'ℹ️',
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-900/20',
                    borderColor: 'border-blue-500/30',
                    message: 'You are already using the latest version of the application.'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <span className={config.color}>{config.title}</span>
                </div>
            } 
            maxWidth="md" 
            zIndex={9999}
        >
            <div className="p-6">
                <div className="space-y-4">
                    {/* Status Message */}
                    <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {config.message}
                        </p>
                    </div>

                    {/* Build Information - only show for success */}
                    {status === 'success' && buildInfo && (
                        <div className="bg-slate-700 rounded-lg p-4">
                            <h4 className="text-lg font-semibold text-white mb-3">New build information</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Version:</span>
                                    <span className="text-slate-200 font-mono">{buildInfo.version}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Build Date:</span>
                                    <span className="text-slate-200 font-mono">
                                        {formatBuildDate(buildInfo.buildDate)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Vite Version:</span>
                                    <span className="text-slate-200 font-mono">{buildInfo.viteVersion || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700 p-4 text-center">
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md transition-colors duration-150"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};