import './nav.css';
import '../workspace.css';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import { useEffect, useRef, useState } from 'react';
import Modal from '../modal/modal';
import { GiChestnutLeaf } from 'react-icons/gi';

export const Nav = () => {
    const [isOpen, setIsOpen] = useState(false); // logout modal
    const [menuOpen, setMenuOpen] = useState(false); // mobile menu
    const menuToggle = useRef(null);

    const { user, logout, isLocalMode } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogOut = async () => {
        setIsOpen(false);
        setMenuOpen(false);
        await logout();
        navigate('/');
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const closeMenu = () => setMenuOpen(false);

    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 761px)');
        const onResize = () => { if (desktop.matches) setMenuOpen(false); };
        desktop.addEventListener('change', onResize);
        return () => desktop.removeEventListener('change', onResize);
    }, []);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <>
            {isOpen && (
                <Modal setIsOpen={setIsOpen} handleClose={handleClose} modalTitle="Are you sure you want to exit?">
                    <div className="nav__modalActions">
                        <button type="button" className="workspace-button workspace-button--danger" onClick={handleLogOut}>
                            Yes
                        </button>
                        <button type="button" className="workspace-button workspace-button--secondary" onClick={handleClose}>
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}

            <nav className="nav" aria-label="Primary navigation">
                <div className="nav__inner">
                    <Link to="/" className="logo" onClick={closeMenu}>
                        <GiChestnutLeaf />
                        <span>Cannagotchi</span>
                    </Link>

                    <button
                        type="button"
                        className="nav__toggle"
                        ref={menuToggle}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                        aria-controls="app-navigation"
                        onClick={() => setMenuOpen((v) => !v)}
                    >
                        <span className="nav__bar" />
                        <span className="nav__bar" />
                        <span className="nav__bar" />
                    </button>

                    <div id="app-navigation" className={`nav__links ${menuOpen ? 'is-open' : ''}`}>
                        <NavLink to="/garden" onClick={closeMenu}>Garden</NavLink>
                        {user ? (
                            <>
                                <NavLink to="/home" onClick={closeMenu}>
                                    Home
                                </NavLink>
                                <NavLink to="/plants" onClick={closeMenu}>
                                    My plants
                                </NavLink>
                                <button
                                    type="button"
                                    className="nav__logout"
                                    onClick={() => {
                                        if (window.matchMedia('(max-width: 760px)').matches) {
                                            menuToggle.current?.focus();
                                        }
                                        setIsOpen(true);
                                        closeMenu();
                                    }}
                                >
                                    {isLocalMode ? 'Exit local garden' : 'Log out'}
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" onClick={closeMenu}>
                                    Log in
                                </NavLink>
                                <NavLink to="/signup" className="nav__cta" onClick={closeMenu}>
                                    Sign up
                                </NavLink>
                            </>
                        )}
                    </div>
                </div>

                {/* Backdrop for mobile */}
                <button
                    type="button"
                    className={`nav__backdrop ${menuOpen ? 'is-open' : ''}`}
                    aria-label="Close menu"
                    tabIndex={menuOpen ? 0 : -1}
                    onClick={closeMenu}
                />
            </nav>
        </>
    );
};
