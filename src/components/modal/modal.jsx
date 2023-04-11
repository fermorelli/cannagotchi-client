import './modal.css';

export const Modal = ({ children, setIsOpen, handleClose, modalTitle }) => {
    if (!setIsOpen) {
      return null;
    }
    return (
      <div className="modalBackground">
        <div className="modalContainer">
          <div className="modalHeader">
            <p>{modalTitle}</p>
            <i className="fa-solid fa-xmark" onClick={() => handleClose()}></i>
          </div>
          <div className="modalBody">{children}</div>
        </div>
      </div>
    );
  };
  
  export default Modal;