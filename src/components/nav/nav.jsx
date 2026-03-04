import './nav.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import { useEffect, useState } from 'react';
import Modal from '../modal/modal';
import { GiChestnutLeaf } from 'react-icons/gi';

export const Nav = () => {
    const [isOpen, setIsOpen] = useState(false); // logout modal
    const [confirm, setConfirm] = useState(false);

    const [menuOpen, setMenuOpen] = useState(false); // mobile menu

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogOut = async () => {
        setIsOpen(false);
        setMenuOpen(false);
        await logout();
        navigate('/');
    };

    const handleClose = () => {
        setIsOpen(false);
        setConfirm(false);
    };

    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <nav className="nav">
            {isOpen && (
                <Modal setIsOpen={setIsOpen} modalTitle={!confirm && 'Are you sure you want to exit?'}>
                    <div className="addModalButtons">
                        <button onClick={handleLogOut} className={confirm ? 'disabled' : null}>
                            Yes
                        </button>
                        <span style={{ cursor: 'pointer' }} onClick={handleClose}>
                            {!confirm && 'Cancel'}
                        </span>
                    </div>
                </Modal>
            )}

            <div className="nav__inner">
                <Link to="/" className="logo" onClick={closeMenu}>
                    <GiChestnutLeaf />
                    <span>Cannagotchi</span>
                </Link>

                <button
                    type="button"
                    className="nav__toggle"
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    <span className="nav__bar" />
                    <span className="nav__bar" />
                    <span className="nav__bar" />
                </button>

                <div className={`nav__links ${menuOpen ? 'is-open' : ''}`}>
                    {user ? (
                        <>
                            <Link to="/home" onClick={closeMenu}>
                                Home
                            </Link>
                            <Link to="/plants" onClick={closeMenu}>
                                My Plants
                            </Link>
                            <button
                                type="button"
                                className="nav__logout"
                                onClick={() => {
                                    setIsOpen(true);
                                    closeMenu();
                                }}
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={closeMenu}>
                                Log in
                            </Link>
                            <Link to="/signup" className="nav__cta" onClick={closeMenu}>
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Backdrop for mobile */}
            <button
                type="button"
                className={`nav__backdrop ${menuOpen ? 'is-open' : ''}`}
                aria-label="Close menu"
                onClick={closeMenu}
            />
        </nav>
    );
};