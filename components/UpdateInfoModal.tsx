import React from 'react';

interface BuildInfo {
    buildDate: string;
    buildTimestamp: number;
    version: string;
    viteVersion?: string;
}

interface UpdateInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: 'success' | 'fail' | 'unchanged';
    buildInfo?: BuildInfo | null;
}

export const UpdateInfoModal: React.FC<UpdateInfoModalProps> = ({ 
    isOpen, 
    onClose, 
    status, 
    buildInfo 
}) => {
    // Handle escape key to close modal
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const formatBuildDate = (dateString: string) => {
        if (!dateString || dateString === 'Unknown') return 'Unknown';
        try {
            const date = new Date(dateString);
            const formatted = date.toLocaleString('de-DE', {
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
                    message: 'Die Anwendung wurde erfolgreich auf die neueste Version aktualisiert.'
                };
            case 'fail':
                return {
                    title: 'Fail',
                    icon: '❌',
                    color: 'text-red-400',
                    bgColor: 'bg-red-900/20',
                    borderColor: 'border-red-500/30',
                    message: 'Der Server konnte nicht erreicht werden. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es später erneut.'
                };
            case 'unchanged':
                return {
                    title: 'Unchanged',
                    icon: 'ℹ️',
                    color: 'text-blue-400',
                    bgColor: 'bg-blue-900/20',
                    borderColor: 'border-blue-500/30',
                    message: 'Sie verwenden bereits die aktuellste Version der Anwendung.'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">{config.icon}</span>
                        <h2 className={`text-2xl font-bold ${config.color}`}>{config.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-150"
                        aria-label="Close update info"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
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
                                <h4 className="text-lg font-semibold text-white mb-3">Neue Build Information</h4>
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
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
};