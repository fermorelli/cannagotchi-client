import './footer.css';
import { Link } from 'react-router-dom';
import { BsFacebook, BsInstagram, BsLinkedin } from 'react-icons/bs';
import { GiChestnutLeaf } from 'react-icons/gi';

export const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer__inner">
                <div className="footer__brand">
                    <Link to="/" className="footer__logo">
                        <GiChestnutLeaf />
                        <span>Cannagotchi</span>
                    </Link>
                    <p className="footer__copy">
                        A calmer way to organize your grow, capture routines, and keep every plant history in one place.
                    </p>
                </div>

                <div className="footer__group">
                    <span className="footer__eyebrow">Explore</span>
                    <div className="footer__links">
                        <Link to="/">Home</Link>
                        <a href="/#about">About</a>
                        <Link to="/faqs">FAQs</Link>
                    </div>
                </div>

                <div className="footer__group">
                    <span className="footer__eyebrow">Social</span>
                    <div className="footer__socials">
                        <a href="https://www.instagram.com/ffermorelli" target="_blank" rel="noreferrer" aria-label="Instagram">
                            <BsInstagram />
                        </a>
                        <a href="https://www.facebook.com/ilcosme18" target="_blank" rel="noreferrer" aria-label="Facebook">
                            <BsFacebook />
                        </a>
                        <a href="https://www.ilinkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                            <BsLinkedin />
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer__bottom">
                <span>Copyright Fernando Morelli 2022</span>
                <span>Built for growers who like order, rhythm, and clean records.</span>
            </div>
        </footer>
    );
};
