import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import '../crud.css';
import Modal from '../modal/modal';
import { schema } from './validations';
import { Footer } from '../footer/Footer';

export const AddUser = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [success, isSuccess] = useState(false);
    const [errmsg, setErrmsg] = useState('');
    const back = '/api/';

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        mode: 'onBlur',
        resolver: joiResolver(schema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
        },
    });

    const onSubmit = async (values) => {
        setErrmsg('');

        try {
            const response = await fetch(`${back}users`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Access-Control-Allow-Origin': 'https://localhost:3000',
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (data.error === false) {
                isSuccess(true);
                setIsOpen(true);
                reset();
                return;
            }

            isSuccess(false);
            setErrmsg('The user could not be created. Please try again.');
        } catch (error) {
            console.log(error.message);
            isSuccess(false);
            setErrmsg('Something went wrong while creating the user.');
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const addAnother = () => {
        setIsOpen(false);
        isSuccess(false);
        reset();
    };

    return (
        <>
            {isOpen && (
                <Modal setIsOpen={setIsOpen} handleClose={handleClose} modalTitle={success ? 'User created' : 'Something went wrong'}>
                    <p>{success ? 'The user profile was added successfully.' : 'Please review the data and try again.'}</p>
                    <div className="crud-modalActions">
                        <Link className="crud-modalPrimary" to="/users" onClick={handleClose}>
                            View user list
                        </Link>
                        <button type="button" className="crud-modalSecondary" onClick={addAnother}>
                            Add another user
                        </button>
                    </div>
                </Modal>
            )}

            <div className="crud-page">
                <div className="container crud-shell">
                    <aside className="crud-side">
                        <div>
                            <span className="section-label crud-side__eyebrow">New internal profile</span>
                            <h2 className="crud-side__title">A place for a new profile.</h2>
                            <p className="crud-side__copy">
                                Add a name and email to create a profile in the user list.
                            </p>
                        </div>

                        <div className="crud-side__list">
                            <article className="crud-side__item">
                                <strong>Clear identity</strong>
                                <p>First name, last name, and email stay visible from the list view.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Contact details</strong>
                                <p>Use the correct email so the profile is easy to identify.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Review later</strong>
                                <p>Find the profile in the user list whenever you need to update it.</p>
                            </article>
                        </div>
                    </aside>

                    <section className="crud-panel">
                        <div className="crud-panel__header">
                            <span className="section-label">User management</span>
                            <h1>Add a new user</h1>
                            <p>Enter the name and email for this profile.</p>
                        </div>

                        {errmsg && <div className="crud-alert">{errmsg}</div>}

                        <form className="crud-form" onSubmit={handleSubmit(onSubmit)}>
                            <div className="crud-formRow">
                                <label className="crud-field">
                                    <span id="add-user-first-label">First name</span>
                                    <input type="text" placeholder="Alex" autoComplete="given-name" aria-labelledby="add-user-first-label" aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? 'add-user-first-error' : undefined} {...register('firstName')} />
                                    {errors.firstName && <span id="add-user-first-error" className="crud-fieldError" role="alert">{errors.firstName.message}</span>}
                                </label>
                                <label className="crud-field">
                                    <span id="add-user-last-label">Last name</span>
                                    <input type="text" placeholder="Rivera" autoComplete="family-name" aria-labelledby="add-user-last-label" aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? 'add-user-last-error' : undefined} {...register('lastName')} />
                                    {errors.lastName && <span id="add-user-last-error" className="crud-fieldError" role="alert">{errors.lastName.message}</span>}
                                </label>
                            </div>

                            <label className="crud-field">
                                <span id="add-user-email-label">Email</span>
                                <input type="email" placeholder="you@example.com" autoComplete="email" aria-labelledby="add-user-email-label" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'add-user-email-error' : undefined} {...register('email')} />
                                {errors.email && <span id="add-user-email-error" className="crud-fieldError" role="alert">{errors.email.message}</span>}
                            </label>

                            <div className="crud-actions">
                                <button className="crud-button crud-button--primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating user...' : 'Create user'}
                                </button>
                                <Link className="crud-button crud-button--secondary" to="/users">
                                    Back to users
                                </Link>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
};
