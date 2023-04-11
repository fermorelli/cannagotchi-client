import './footer.css';
import { Link } from 'react-router-dom';
import { BsInstagram } from 'react-icons/bs'
import { BsFacebook } from 'react-icons/bs'
import { BsLinkedin } from 'react-icons/bs'

export const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer_links">
                <Link to={'/'}><span>HOME</span></Link>
                <Link to={'/#about'}><span>ABOUT</span></Link>
                <Link to={'/faqs'}><span>FAQs</span></Link>
            </div>
            <div className="socials">
                <a href={"https://www.instagram.com/ffermorelli"} target={"_blank"} rel={"noreferrer"}><BsInstagram/></a>
                <a href={"https://www.facebook.com/ilcosme18"} target={"_blank"} rel={"noreferrer"}><BsFacebook/></a>
                <a href={"https://www.ilinkedin.com"} target={"_blank"} rel={"noreferrer"}><BsLinkedin/></a>
            </div>
            <div className="copyright">
                <span>© Copyright Fernando Morelli 2022</span>
            </div>
        </footer>
    )
}