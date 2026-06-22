import {type ReactNode, useEffect } from 'react';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

export function Dialog({ open, onClose, children }: DialogProps) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
