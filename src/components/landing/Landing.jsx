import './landing.css';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiClock, FiTrendingUp } from 'react-icons/fi';
import { Footer } from '../footer/Footer';
import img1 from '../../assets/img1.jpg';
import img2 from '../../assets/img2.webp';

export const Landing = () => {
    return (
        <>
            <main className="landing">
                <section className="landing-hero">
                    <div className="container landing-hero__inner">
                        <div className="landing-hero__copy">
                            <span className="section-label">Grow journal for modern home cultivators</span>

                            <h1>Keep your grow calm, clean, and documented from sprout to harvest.</h1>

                            <p>
                                Cannagotchi turns scattered notes into a clearer routine. Track each plant, record the important
                                moments, and make the next cycle easier to manage.
                            </p>

                            <div className="landing-hero__actions">
                                <Link className="landing-btn landing-btn--primary" to="/signup">
                                    Create account
                                    <FiArrowRight />
                                </Link>
                                <a className="landing-btn landing-btn--ghost" href="#about">
                                    See how it works
                                </a>
                            </div>

                            <div className="landing-hero__proof">
                                <article>
                                    <strong>Readable records</strong>
                                    <span>Plant history that stays easy to scan as your grow evolves.</span>
                                </article>
                                <article>
                                    <strong>Better rhythm</strong>
                                    <span>Daily tasks and milestones become more obvious and less stressful.</span>
                                </article>
                                <article>
                                    <strong>Cleaner decisions</strong>
                                    <span>Compare genetics, dates, and routines without digging through old notes.</span>
                                </article>
                            </div>
                        </div>

                        <div className="landing-hero__visual">
                            <div className="landing-showcase">
                                <div className="landing-showcase__header">
                                    <div>
                                        <span className="landing-showcase__eyebrow">Daily grow board</span>
                                        <h2>Everything important at a glance</h2>
                                    </div>
                                    <span className="landing-showcase__badge">4 active plants</span>
                                </div>

                                <div className="landing-showcase__metrics">
                                    <article>
                                        <span>Watering</span>
                                        <strong>2 due today</strong>
                                    </article>
                                    <article>
                                        <span>Harvest window</span>
                                        <strong>1 this week</strong>
                                    </article>
                                    <article>
                                        <span>Cycle notes</span>
                                        <strong>12 saved</strong>
                                    </article>
                                </div>

                                <div className="landing-showcase__cards">
                                    <article className="landing-plantCard">
                                        <div>
                                            <strong>Lemon Haze</strong>
                                            <span>Sativa / Indoor</span>
                                        </div>
                                        <span className="landing-plantCard__status">Week 8</span>
                                    </article>

                                    <article className="landing-plantCard">
                                        <div>
                                            <strong>Northern Lights</strong>
                                            <span>Indica / Outdoor</span>
                                        </div>
                                        <span className="landing-plantCard__status is-warm">Feed today</span>
                                    </article>
                                </div>
                            </div>

                            <div className="landing-photoCard">
                                <img src={img1} alt="Cannabis plant detail" />
                                <div className="landing-photoCard__caption">
                                    <span>Plant snapshots</span>
                                    <strong>Visual history that makes each run easier to understand.</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-section" id="about">
                    <div className="container">
                        <div className="landing-section__header">
                            <span className="section-label">What changes</span>
                            <h2>A more organized workflow for the whole cycle</h2>
                            <p>
                                The goal is simple: make your cultivation log feel less like admin work and more like a clear control
                                panel for your grow.
                            </p>
                        </div>

                        <div className="landing-grid">
                            <article className="landing-grid__card">
                                <FiBookOpen />
                                <h3>Structured plant profiles</h3>
                                <p>Keep genetics, grow mode, germination dates, and observations in a single place.</p>
                            </article>

                            <article className="landing-grid__card">
                                <FiClock />
                                <h3>Milestones that stay visible</h3>
                                <p>Surface the next important moment instead of relying on memory or scattered reminders.</p>
                            </article>

                            <article className="landing-grid__card">
                                <FiTrendingUp />
                                <h3>Runs you can compare later</h3>
                                <p>Learn from each cycle with cleaner records and a more consistent tracking habit.</p>
                            </article>
                        </div>
                    </div>
                </section>

                <section className="landing-story">
                    <div className="container landing-story__inner">
                        <div className="landing-story__media">
                            <img src={img2} alt="Grow planning preview" />
                            <div className="landing-story__floating">
                                <span>Harvest planning</span>
                                <strong>Know what is coming next before the week gets busy.</strong>
                            </div>
                        </div>

                        <div className="landing-story__content">
                            <span className="section-label">A better rhythm</span>
                            <h2>Less notebook chaos. More confidence in each step.</h2>
                            <p>
                                Cannagotchi is designed to keep the essentials visible. The interface stays clean, the information stays
                                readable, and your next action is never buried under noise.
                            </p>

                            <ul className="landing-story__list">
                                <li>
                                    <span>01</span>
                                    <div>
                                        <strong>Track each plant like a real collection</strong>
                                        <p>Every plant gets its own history, dates, genetics, and edit flow.</p>
                                    </div>
                                </li>
                                <li>
                                    <span>02</span>
                                    <div>
                                        <strong>Review the current cycle quickly</strong>
                                        <p>Scan your grow without opening a notebook, searching messages, or guessing the timeline.</p>
                                    </div>
                                </li>
                                <li>
                                    <span>03</span>
                                    <div>
                                        <strong>Build a cleaner routine over time</strong>
                                        <p>Better records make each future run a little more intentional and a lot less messy.</p>
                                    </div>
                                </li>
                            </ul>

                            <div className="landing-story__actions">
                                <Link className="landing-btn landing-btn--primary landing-btn--compact" to="/signup">
                                    Start tracking
                                </Link>
                                <Link className="landing-story__loginLink" to="/login">
                                    Already have an account? Log in
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="landing-cta">
                    <div className="container">
                        <div className="landing-cta__panel">
                            <div className="landing-cta__copy">
                                <span className="section-label">Ready to refresh your workflow?</span>
                                <h2>Move from scattered notes to a grow log you actually want to open every day.</h2>
                            </div>

                            <div className="landing-cta__actions">
                                <Link className="landing-btn landing-btn--primary" to="/signup">
                                    Create account
                                </Link>
                                <Link className="landing-btn landing-btn--ghost" to="/login">
                                    Log in
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
};
