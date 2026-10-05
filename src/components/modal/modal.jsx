import './modal.css';
import { useEffect, useId, useRef } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

export const Modal = ({ children, setIsOpen, handleClose, modalTitle, busy = false }) => {
    const titleId = useId();
    const modalRef = useRef(null);
    const closeRef = useRef(handleClose);
    closeRef.current = handleClose;
    const enabled = Boolean(setIsOpen);
    useEffect(() => {
        const modal = modalRef.current;
        if (!modal) return undefined;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const focusable = () => [...modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((element) => element.tabIndex >= 0 && !element.disabled && element.getClientRects().length);
        (modal.querySelector('[data-autofocus]') || focusable()[0] || modal).focus({ preventScroll: true });
        const onKeyDown = (event) => {
            if (event.key === 'Escape' && closeRef.current) {
                event.preventDefault();
                event.stopPropagation();
                closeRef.current();
            }
            if (event.key !== 'Tab') return;
            const elements = focusable();
            const first = elements[0];
            const last = elements[elements.length - 1];
            if (!first) {
                event.preventDefault();
                modal.focus();
            } else if (!elements.includes(document.activeElement) || (event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
                event.preventDefault();
                (event.shiftKey ? last : first).focus();
            }
        };
        document.addEventListener('keydown', onKeyDown, true);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKeyDown, true);
            if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        };
    }, [enabled]);
    if (!setIsOpen) {
        return null;
    }

    const onClose = handleClose || null;

    return (
        <div className="modalBackground" role="presentation" onClick={onClose || undefined}>
            <div
                className="modalContainer"
                ref={modalRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-busy={busy || undefined}
                aria-labelledby={titleId}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modalHeader">
                    <h2 id={titleId}>{modalTitle}</h2>
                    {onClose && (
                        <button type="button" className="modalClose" onClick={onClose} aria-label="Close modal" disabled={busy}>
                            <IoCloseOutline />
                        </button>
                    )}
                </div>
                <div className="modalBody">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
