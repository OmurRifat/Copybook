'use client';

import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content">
                    {title && (
                        <div className="modal-header">
                            <h5 className="modal-title">{title}</h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>
                    )}
                    <div className="modal-body">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
