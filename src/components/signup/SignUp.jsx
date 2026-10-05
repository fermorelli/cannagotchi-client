import './signup.css';
import '../auth.css';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { deleteUser } from 'firebase/auth';
import { FiClock, FiLayers } from 'react-icons/fi';
import { GiOakLeaf, GiPlantSeed } from 'react-icons/gi';
import Modal from '../modal/modal';
import { schema } from './validation';
import { createAccount } from './createAccount.mjs';
import { useAuth } from '../../context/authContext.jsx';
import { auth } from '../../firebase/firebase';
import { Loader } from '../loader/loader';
import { Footer } from '../footer/Footer';

export const SignUp = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [success, isSuccess] = useState(false);
    const [fetching, isFetching] = useState(false);
    const [errmsg, setErrmsg] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [accountCreated, setAccountCreated] = useState(false);
    const submittingRef = useRef(false);
    const activeRef = useRef(true);

    const { regNew, isLogged } = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        resetField,
        watch,
        getValues,
        trigger,
        formState: { errors },
    } = useForm({
        mode: 'onBlur',
        resolver: joiResolver(schema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const password = watch('password');
    useEffect(() => {
        if (getValues('confirmPassword')) trigger('confirmPassword');
    }, [password, getValues, trigger]);
    useEffect(() => {
        activeRef.current = true;
        return () => { activeRef.current = false; };
    }, []);

    const onSubmit = async (values) => {
        if (submittingRef.current || accountCreated) return;
        submittingRef.current = true;
        isFetching(true);
        setErrmsg('');

        try {
            await createAccount(values, { registerAccount: regNew, removeAccount: deleteUser, currentUser: () => auth.currentUser });
            isLogged(true);
            if (!activeRef.current) return;

            isSuccess(true);
            setAccountCreated(true);
            setIsOpen(true);
            setShowPasswords(false);
            reset();
        } catch (err) {
            if (!activeRef.current) return;
            isSuccess(false);
            setAccountCreated(Boolean(err.accountCreated));
            if (err.accountCreated) {
                resetField('password');
                resetField('confirmPassword');
                setShowPasswords(false);
            }
            switch (err?.code) {
                case 'auth/email-already-in-use':
                    setErrmsg('An account could not be created with these details. Try logging in or use another email address.');
                    break;
                case 'auth/network-request-failed':
                    setErrmsg('Check your connection and try again.');
                    break;
                case 'auth/weak-password':
                case 'auth/password-does-not-meet-requirements':
                    setErrmsg('This password does not meet the account security requirements. Choose a longer, unique passphrase.');
                    break;
                case 'auth/invalid-email':
                    setErrmsg('Please enter a valid email address');
                    break;
                case 'auth/operation-not-allowed':
                    setErrmsg('Email/password sign up is not enabled right now');
                    break;
                case 'auth/too-many-requests':
                    setErrmsg('Too many attempts. Please wait a moment and try again.');
                    break;
                case 'signup/profile-rejected':
                case 'signup/profile-unconfirmed':
                case 'signup/rollback-failed':
                case 'signup/session-changed':
                    setErrmsg(err.message);
                    break;
                default:
                    setErrmsg('Something went wrong. Please try again.');
            }
        } finally {
            submittingRef.current = false;
            if (activeRef.current) isFetching(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        isLogged(false);
    };

    return (
        <>
            {fetching && <Loader />}

            <div className="auth-page auth-page--signup">
                {isOpen && (
                    <Modal setIsOpen={setIsOpen} handleClose={handleClose} modalTitle={success ? 'Account created' : 'Something went wrong'}>
                        <p>Your workspace is ready. Head into the dashboard and add the first plant when you are ready.</p>
                        <div className="auth-modalActions">
                            <Link className="auth-modalPrimary" to="/home" onClick={handleClose}>
                                Go to dashboard
                            </Link>
                            <button type="button" className="auth-modalSecondary" onClick={handleClose}>
                                Stay here
                            </button>
                        </div>
                    </Modal>
                )}

                <div className="container auth-shell">
                    <section className="auth-side">
                        <div>
                            <span className="section-label auth-kicker">Start a cleaner grow log</span>
                            <div className="auth-heading">
                                <h2>A place for every plant.</h2>
                                <p>
                                    Set up your account, add your first plant, and move the whole grow into a layout that is easier to
                                    revisit and manage.
                                </p>
                            </div>
                        </div>

                        <div className="auth-side__cards">
                            <article className="auth-side__card">
                                <GiPlantSeed />
                                <strong>Start with the essentials</strong>
                                <p>Profile, plant name, genetics, grow mode, and germination date.</p>
                            </article>

                            <article className="auth-side__card">
                                <FiLayers />
                                <strong>Give each plant its own record</strong>
                                <p>Keep each run separate so your collection never turns into one long note.</p>
                            </article>

                            <article className="auth-side__card">
                                <FiClock />
                                <strong>Track the whole cycle</strong>
                                <p>Keep dates and milestones visible while the plant moves through each stage.</p>
                            </article>

                            <article className="auth-side__card">
                                <GiOakLeaf />
                                <strong>Make future runs smarter</strong>
                                <p>Good records make it easier to compare what worked and what should change.</p>
                            </article>
                        </div>

                        <div className="auth-side__panel">
                            <div className="auth-side__panelHeader">
                                <span>What you get first</span>
                                <span className="auth-side__status">Fresh setup</span>
                            </div>

                            <div className="auth-side__list">
                                <div className="auth-side__item">
                                    <strong>Private grow profile</strong>
                                    <span>Your account becomes the base for plants, edits, and future records.</span>
                                </div>
                                <div className="auth-side__item">
                                    <strong>Clear starting point</strong>
                                    <span>Move from sign up to your first plant without getting lost in the interface.</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="auth-card">
                        <div className="auth-card__header">
                            <span className="section-label">Create your account</span>
                            <h1>Sign up</h1>
                            <p>Create your profile and start recording your grow.</p>
                        </div>

                        {errmsg && <div className="auth-alert" role="alert">{errmsg}{accountCreated && <Link className="signup-recovery" to="/login">Check account with login</Link>}</div>}
                        {success && accountCreated && <p className="signup-passwordHint" role="status">Account created. <Link className="signup-recovery" to="/home">Go to dashboard</Link></p>}

                        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate aria-busy={fetching}>
                            <label className="auth-field">
                                <span>First name</span>
                                <input
                                    type="text"
                                    placeholder="Alex"
                                    autoComplete="given-name"
                                    disabled={fetching || accountCreated}
                                    required
                                    aria-invalid={errors.firstName ? 'true' : 'false'}
                                    aria-describedby={errors.firstName ? 'signup-firstName-error' : undefined}
                                    {...register('firstName')}
                                />
                            </label>
                            {errors.firstName && <span id="signup-firstName-error" className="auth-fieldError">{errors.firstName.message}</span>}

                            <label className="auth-field">
                                <span>Last name</span>
                                <input
                                    type="text"
                                    placeholder="Rivera"
                                    autoComplete="family-name"
                                    disabled={fetching || accountCreated}
                                    required
                                    aria-invalid={errors.lastName ? 'true' : 'false'}
                                    aria-describedby={errors.lastName ? 'signup-lastName-error' : undefined}
                                    {...register('lastName')}
                                />
                            </label>
                            {errors.lastName && <span id="signup-lastName-error" className="auth-fieldError">{errors.lastName.message}</span>}

                            <label className="auth-field">
                                <span>Email</span>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    disabled={fetching || accountCreated}
                                    required
                                    aria-invalid={errors.email ? 'true' : 'false'}
                                    aria-describedby={errors.email ? 'signup-email-error' : undefined}
                                    {...register('email')}
                                />
                            </label>
                            {errors.email && <span id="signup-email-error" className="auth-fieldError">{errors.email.message}</span>}

                            <label className="auth-field">
                                <span>Password</span>
                                <input
                                    type={showPasswords ? 'text' : 'password'}
                                    placeholder="A unique passphrase"
                                    autoComplete="new-password"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    disabled={fetching || accountCreated}
                                    required
                                    aria-invalid={errors.password ? 'true' : 'false'}
                                    aria-describedby={`signup-password-hint${errors.password ? ' signup-password-error' : ''}`}
                                    {...register('password')}
                                />
                            </label>
                            <p id="signup-password-hint" className="signup-passwordHint">Use 15–128 characters. A unique phrase works well; spaces and symbols are welcome.</p>
                            {errors.password && <span id="signup-password-error" className="auth-fieldError">{errors.password.message}</span>}

                            <label className="auth-field">
                                <span>Confirm password</span>
                                <input
                                    type={showPasswords ? 'text' : 'password'}
                                    placeholder="Repeat your password"
                                    autoComplete="new-password"
                                    autoCapitalize="none"
                                    spellCheck={false}
                                    disabled={fetching || accountCreated}
                                    required
                                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                                    aria-describedby={errors.confirmPassword ? 'signup-confirmPassword-error' : undefined}
                                    {...register('confirmPassword')}
                                />
                            </label>
                            {errors.confirmPassword && <span id="signup-confirmPassword-error" className="auth-fieldError">{errors.confirmPassword.message}</span>}
                            <label className="signup-passwordToggle">
                                <input type="checkbox" checked={showPasswords} onChange={(event) => setShowPasswords(event.target.checked)} disabled={fetching || accountCreated} />
                                <span>Show passwords</span>
                            </label>

                            <button className="auth-submit" type="submit" disabled={fetching || accountCreated}>
                                {fetching ? 'Creating account...' : 'Create account'}
                            </button>
                        </form>

                        <div className="auth-card__footer">
                            <span>
                                Already have an account? <Link to="/login">Log in</Link>
                            </span>
                            <p className="auth-footerNote">Once you are in, the next step is adding the first plant and its core details.</p>
                        </div>
                    </section>
                </div>
            </div>

            <Footer />
        </>
    );
};
