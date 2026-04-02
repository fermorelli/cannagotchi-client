import './modal.css';
import { IoCloseOutline } from 'react-icons/io5';

export const Modal = ({ children, setIsOpen, handleClose, modalTitle }) => {
    if (!setIsOpen) {
        return null;
    }

    const onClose = handleClose || null;

    return (
        <div className="modalBackground" role="presentation" onClick={onClose || undefined}>
            <div
                className="modalContainer"
                role="dialog"
                aria-modal="true"
                aria-label={modalTitle}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="modalHeader">
                    <p>{modalTitle}</p>
                    {onClose && (
                        <button type="button" className="modalClose" onClick={onClose} aria-label="Close modal">
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
