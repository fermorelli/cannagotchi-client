import './login.css';
import '../auth.css';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiBookOpen, FiClock, FiShield } from 'react-icons/fi';
import { GiOakLeaf } from 'react-icons/gi';
import { schema } from './validation';
import { useAuth } from '../../context/authContext.jsx';
import { Loader } from '../loader/loader';
import { Footer } from '../footer/Footer';

export const LogIn = () => {
    const [fetching, isFetching] = useState(false);
    const [errmsg, setErrmsg] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        mode: 'onBlur',
        resolver: joiResolver(schema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (values) => {
        isFetching(true);
        setErrmsg('');

        try {
            await login(values.email, values.password);
            navigate('/home');
        } catch (err) {
            switch (err?.code) {
                case 'auth/wrong-password':
                case 'auth/user-not-found':
                case 'auth/invalid-credential':
                case 'auth/invalid-login-credentials':
                    setErrmsg('Email or password is incorrect');
                    break;
                case 'auth/network-request-failed':
                    setErrmsg('Network request failed');
                    break;
                case 'auth/too-many-requests':
                    setErrmsg('Too many attempts. Please wait a moment and try again.');
                    break;
                default:
                    setErrmsg('Something went wrong. Please try again.');
            }
        } finally {
            isFetching(false);
        }
    };

    return (
        <>
            {fetching && <Loader />}

            <div className="auth-page auth-page--login">
                <div className="container auth-shell">
                    <section className="auth-side">
                        <div>
                            <span className="section-label auth-kicker">Secure grow workspace</span>
                            <div className="auth-heading">
                                <h1>Pick up your grow exactly where you left it.</h1>
                                <p>
                                    Log back in to review plant history, update current runs, and keep your cultivation timeline moving.
                                </p>
                            </div>
                        </div>

                        <div className="auth-side__cards">
                            <article className="auth-side__card">
                                <GiOakLeaf />
                                <strong>Your plant data stays together</strong>
                                <p>Profiles, genetics, dates, and notes are all in one workspace.</p>
                            </article>

                            <article className="auth-side__card">
                                <FiClock />
                                <strong>Return to the current cycle fast</strong>
                                <p>No digging through paper notes just to remember what happened last week.</p>
                            </article>

                            <article className="auth-side__card">
                                <FiBookOpen />
                                <strong>Cleaner grow records</strong>
                                <p>Every run becomes easier to review and compare over time.</p>
                            </article>

                            <article className="auth-side__card">
                                <FiShield />
                                <strong>Account-based access</strong>
                                <p>Your grow log stays tied to your profile so the workspace feels personal.</p>
                            </article>
                        </div>

                        <div className="auth-side__panel">
                            <div className="auth-side__panelHeader">
                                <span>Inside your dashboard</span>
                                <span className="auth-side__status">Ready</span>
                            </div>

                            <div className="auth-side__list">
                                <div className="auth-side__item">
                                    <strong>Plant overview</strong>
                                    <span>See your active plants and jump into each one quickly.</span>
                                </div>
                                <div className="auth-side__item">
                                    <strong>Timeline context</strong>
                                    <span>Review germination dates, growth stage, and harvest estimates without friction.</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="auth-card">
                        <div className="auth-card__header">
                            <span className="section-label">Welcome back</span>
                            <h2>Log in</h2>
                            <p>Access your plants, notes, and next tasks from a calmer, more organized workspace.</p>
                        </div>

                        {errmsg && <div className="auth-alert">{errmsg}</div>}

                        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                            <label className="auth-field">
                                <span>Email</span>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    aria-invalid={errors.email ? 'true' : 'false'}
                                    {...register('email')}
                                />
                            </label>
                            {errors.email && <span className="auth-fieldError">{errors.email.message}</span>}

                            <label className="auth-field">
                                <span>Password</span>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    aria-invalid={errors.password ? 'true' : 'false'}
                                    {...register('password')}
                                />
                            </label>
                            {errors.password && <span className="auth-fieldError">{errors.password.message}</span>}

                            <button className="auth-submit" type="submit" disabled={fetching}>
                                {fetching ? 'Logging in...' : 'Log in'}
                            </button>
                        </form>

                        <div className="auth-card__footer">
                            <span>
                                New here? <Link to="/signup">Create your account</Link>
                            </span>
                            <p className="auth-footerNote">Start with your profile, then add the first plant in a couple of steps.</p>
                        </div>
                    </section>
                </div>
            </div>

            <Footer />
        </>
    );
};
