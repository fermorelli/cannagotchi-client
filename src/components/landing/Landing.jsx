import './landing.css';
import { Link } from 'react-router-dom';
import { Footer } from '../footer/Footer';
import img1 from '../../assets/img1.jpg';
import img2 from '../../assets/img2.webp';

export const Landing = () => {
    return (
        <>
            <main className="landing">
                {/* HERO full width, same content width via .container */}
                <section className="hero" aria-labelledby="hero-title">
                    <div className="container hero__inner">
                        <div className="hero__copy">
                            <p className="hero__eyebrow">Cannagotchi</p>

                            <h1 id="hero-title" className="hero__title">
                                Track every plant, every day, without the notebook chaos.
                            </h1>

                            <p className="hero__subtitle">
                                Log growth, feeding, training, and notes in one place. Stay consistent with cycle-based reminders and
                                simple milestones so you always know what’s next.
                            </p>

                            <div className="hero__cta">
                                <Link className="btn btn--primary" to="/signup">
                                    Create an account
                                </Link>
                                <a className="btn btn--ghost" href="#about">
                                    Learn more
                                </a>
                            </div>

                            <p className="hero__hint">
                                Already using the app? <Link to="/login" className="link">Log in</Link>
                            </p>

                            <div className="hero__stats" aria-label="Key benefits">
                                <div className="stat">
                                    <div className="stat__value">Fast</div>
                                    <div className="stat__label">quick daily logs</div>
                                </div>
                                <div className="stat">
                                    <div className="stat__value">Clear</div>
                                    <div className="stat__label">readable plant cards</div>
                                </div>
                                <div className="stat">
                                    <div className="stat__value">Consistent</div>
                                    <div className="stat__label">cycle reminders</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ABOUT */}
                <section className="section" id="about" aria-labelledby="about-title">
                    <div className="container">
                        <header className="section__header">
                            <h2 id="about-title" className="section__title">About Cannagotchi</h2>
                            <p className="section__subtitle">
                                A lightweight grow journal built to be fast to use and easy to read.
                            </p>
                        </header>

                        {/* Feature 1 */}
                        <div className="feature feature--imageRight">
                            <div className="feature__copy">
                                <h3 className="feature__title">Your plants, organized like a real collection</h3>
                                <p className="feature__text">
                                    Add each plant with strain, genetics, start date, medium, and your own notes. Keep everything searchable
                                    so you can compare runs and learn what actually works for you.
                                </p>
                                <ul className="feature__list">
                                    <li>Quick logs for watering, feeding, training, and observations</li>
                                    <li>Progress snapshots and notes tied to each plant</li>
                                    <li>Clean layout that stays readable as your collection grows</li>
                                </ul>
                            </div>

                            <div className="feature__media">
                                <img className="cardImage" src={img1} alt="Plant tracking and logs preview" />
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="feature feature--imageLeft">
                            <div className="feature__copy">
                                <h3 className="feature__title">Reminders for cycles, milestones, and harvest windows</h3>
                                <p className="feature__text">
                                    Stay ahead of timing. Cannagotchi helps you estimate key milestones based on your cycle, so you can plan
                                    transitions and harvest without relying on memory.
                                </p>
                                <ul className="feature__list">
                                    <li>Cycle-based estimates to keep your routine consistent</li>
                                    <li>Simple alerts so you don’t miss important windows</li>
                                    <li>Helpful by design, not overwhelming</li>
                                </ul>

                                <div className="feature__ctaRow">
                                    <Link className="btn btn--primary" to="/signup">
                                        Start tracking
                                    </Link>
                                    <span className="muted">Takes less than 2 minutes to add your first plant.</span>
                                </div>
                            </div>

                            <div className="feature__media">
                                <img className="cardImage" src={img2} alt="Predictions and reminders preview" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};