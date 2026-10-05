import { useEffect, useId, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import './garden.css';

export function GardenDialog({ title, children, onClose, className = '', closeDisabled = false, headingLabel = 'FIELD NOTEBOOK', closeLabel = 'Close notebook' }) {
    const ref = useRef(null);
    const titleId = useId();
    useEffect(() => {
        const dialog = ref.current;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        dialog.querySelector('[data-autofocus]')?.focus();
        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
        };
    }, []);
    return (
        <dialog ref={ref} className={`garden-dialog ${className}`} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); if (!closeDisabled) onClose(); }}>
            <div className="garden-dialog__heading">
                <span className="garden-eyebrow">{headingLabel}</span>
                <button type="button" className="garden-icon-button" aria-label={closeLabel} onClick={onClose} disabled={closeDisabled}><FiX /></button>
            </div>
            <h2 id={titleId}>{title}</h2>
            {children}
        </dialog>
    );
}
