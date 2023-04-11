import banner from '../../assets/banner.png';
import './landing.css';
import { Link } from 'react-router-dom';
import { Footer } from '../footer/Footer';
import img1 from '../../assets/img1.jpg';
import img2 from '../../assets/img2.webp';

export const Landing = () => {
    return (
        <>
        <div className="all-landing">
                <div className="banner">
                    <img id="banner" src={banner} alt="cannagotchi banner" />
                    <div className="p-banner">
                        <p>We aim to provide you with a complete set of tracking tools that will help you maintain a delicate control of your crops. We provide a full detailed information about each one of your plants, as well as a prediction system that will help you remember harvest dates, cycles, and much more!</p>
                        <br/>
                        <p>Wanna join in? Start by making a <Link to={'/signup'}><span id="link">new account</span></Link></p>
                    </div>
                </div>
                <div className="about" id='about'>
                    <div className="about_header">
                        <h1>About Cannagotchi</h1>
                    </div>
                    <div className="about_body">
                        <div className="text_img">
                            <div className="text">
                                <p>Cannagotchi is a tracking app that allows you to add your plants to a collection, and then retrieve that information in a way that's very useful to the user experience, since is really easy to read and to handle. You will have the chance to check on that data to maintain a very detailed control over your crops.</p>
                                <br />
                                <p>Cannagotchi is a tracking app that allows you to add your plants to a collection, and then retrieve that information in a way that's very useful to the user experience, since is really easy to read and to handle. You will have the chance to check on that data to maintain a very detailed control over your crops. Cannagotchi is a tracking app that allows you to add your plants to a collection, and then retrieve that information in a way that's very useful to the user experience, since is really easy to read and to handle. You will have the chance to check on that data to maintain a very detailed control over your crops.</p>
                                <br />
                                <p>Cannagotchi is a tracking app that allows you to add your plants to a collection, and then retrieve that information in a way that's very useful to the user experience, since is really easy to read and to handle. You will have the chance to check on that data to maintain a very detailed control over your crops.</p>
                            </div>
                            <img src={img1} alt="tracking app" />
                        </div>
                        <div className="text_img">
                            <img src={img2} id={'img2'} alt="tracking app" />
                            <div className="text">
                                <p>Cannagotchi is a tracking app that allows you to add your plants to a collection, and then retrieve that information in a way that's very useful to the user experience, since is really easy to read and to handle. You will have the chance to check on that data to maintain a very detailed control over your crops.</p>
                                <br />
                                <p>Cannagotchi is a tracking app that allows you to add your plants to a collection, and then retrieve that information in a way that's very useful to the user experience, since is really easy to read and to handle. You will have the chance to check on that data to maintain a very detailed control over your crops. Cannagotchi is a tracking app that allows you to add your plants to a collection, and then retrieve that information in a way that's very useful to the user experience, since is really easy to read and to handle. You will have the chance to check on that data to maintain a very detailed control over your crops.</p>
                                <br />
                                <p>Cannagotchi is a tracking app that allows you to add your plants to a collection, and then retrieve that information in a way that's very useful to the user experience, since is really easy to read and to handle. You will have the chance to check on that data to maintain a very detailed control over your crops.</p>
                            </div>
                        </div>
                    </div>
                </div>
        </div>
        <Footer/>
        </>
    )
}