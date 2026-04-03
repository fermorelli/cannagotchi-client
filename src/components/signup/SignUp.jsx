import './signup.css';
import '../auth.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import { deleteUser } from 'firebase/auth';
import { FiClock, FiLayers } from 'react-icons/fi';
import { GiOakLeaf, GiPlantSeed } from 'react-icons/gi';
import Modal from '../modal/modal';
import { schema } from './validation';
import { useAuth } from '../../context/authContext.jsx';
import { auth } from '../../firebase/firebase';
import { Loader } from '../loader/loader';
import { Footer } from '../footer/Footer';

export const SignUp = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [success, isSuccess] = useState(false);
    const [fetching, isFetching] = useState(false);
    const [errmsg, setErrmsg] = useState('');

    const { regNew, isLogged } = useAuth();
    const back = '/api/';

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        mode: 'onBlur',
        resolver: joiResolver(schema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
        },
    });

    const addUser = async (values) => {
        const response = await fetch(`${back}users`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': 'https://localhost:3000',
            },
            body: JSON.stringify({
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
            }),
        });

        const data = await response.json();
        return data.error === false;
    };

    const rollbackCreatedAccount = async () => {
        if (!auth.currentUser) {
            return;
        }

        try {
            await deleteUser(auth.currentUser);
        } catch (error) {
            console.log(error.message);
        }
    };

    const onSubmit = async (values) => {
        isFetching(true);
        setErrmsg('');
        let createdAuthUser = false;

        try {
            await regNew(values.email, values.password);
            createdAuthUser = true;
            const created = await addUser(values);

            if (!created) {
                await rollbackCreatedAccount();
                isSuccess(false);
                setErrmsg('Your account could not be fully created. Please try again.');
                return;
            }

            isSuccess(true);
            isLogged(true);
            setIsOpen(true);
            reset();
        } catch (err) {
            switch (err?.code) {
                case 'auth/email-already-in-use':
                    setErrmsg('Email already in use, please choose another one');
                    break;
                case 'auth/network-request-failed':
                    setErrmsg('Network request failed');
                    break;
                case 'auth/weak-password':
                    setErrmsg('Please use a stronger password');
                    break;
                case 'auth/invalid-email':
                    setErrmsg('Please enter a valid email address');
                    break;
                case 'auth/operation-not-allowed':
                    setErrmsg('Email/password sign up is not enabled right now');
                    break;
                default:
                    if (createdAuthUser) {
                        await rollbackCreatedAccount();
                    }
                    setErrmsg('Something went wrong. Please try again.');
            }
        } finally {
            isFetching(false);
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
                                <h1>Build a cultivation workspace that feels ordered from day one.</h1>
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
                            <h2>Sign up</h2>
                            <p>Start a neater, more polished cultivation log with a profile built for your own grow routine.</p>
                        </div>

                        {errmsg && <div className="auth-alert">{errmsg}</div>}

                        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                            <label className="auth-field">
                                <span>First name</span>
                                <input
                                    type="text"
                                    placeholder="Alex"
                                    autoComplete="given-name"
                                    aria-invalid={errors.firstName ? 'true' : 'false'}
                                    {...register('firstName')}
                                />
                            </label>
                            {errors.firstName && <span className="auth-fieldError">{errors.firstName.message}</span>}

                            <label className="auth-field">
                                <span>Last name</span>
                                <input
                                    type="text"
                                    placeholder="Rivera"
                                    autoComplete="family-name"
                                    aria-invalid={errors.lastName ? 'true' : 'false'}
                                    {...register('lastName')}
                                />
                            </label>
                            {errors.lastName && <span className="auth-fieldError">{errors.lastName.message}</span>}

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
                                    placeholder="At least 8 characters"
                                    autoComplete="new-password"
                                    aria-invalid={errors.password ? 'true' : 'false'}
                                    {...register('password')}
                                />
                            </label>
                            {errors.password && <span className="auth-fieldError">{errors.password.message}</span>}

                            <button className="auth-submit" type="submit" disabled={fetching}>
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
