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
                            <h1 className="crud-side__title">Create a user record that fits the cleaner workspace.</h1>
                            <p className="crud-side__copy">
                                Add the profile details once and keep the list of users tidy, readable, and easy to maintain.
                            </p>
                        </div>

                        <div className="crud-side__list">
                            <article className="crud-side__item">
                                <strong>Clear identity</strong>
                                <p>First name, last name, and email stay visible from the list view.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Consistent records</strong>
                                <p>The same structure helps the whole app feel more intentional and easier to edit later.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Quick admin flow</strong>
                                <p>Create the record here, then jump back to the user list without friction.</p>
                            </article>
                        </div>
                    </aside>

                    <section className="crud-panel">
                        <div className="crud-panel__header">
                            <span className="section-label">User management</span>
                            <h1>Add a new user</h1>
                            <p>Create a clean profile entry for the app and keep the internal records structured from the start.</p>
                        </div>

                        {errmsg && <div className="crud-alert">{errmsg}</div>}

                        <form className="crud-form" onSubmit={handleSubmit(onSubmit)}>
                            <div className="crud-formRow">
                                <label className="crud-field">
                                    <span>First name</span>
                                    <input type="text" placeholder="Fernando" {...register('firstName')} />
                                </label>
                                <label className="crud-field">
                                    <span>Last name</span>
                                    <input type="text" placeholder="Morelli" {...register('lastName')} />
                                </label>
                            </div>
                            {errors.firstName && <span className="crud-fieldError">{errors.firstName.message}</span>}
                            {errors.lastName && <span className="crud-fieldError">{errors.lastName.message}</span>}

                            <label className="crud-field">
                                <span>Email</span>
                                <input type="email" placeholder="you@example.com" {...register('email')} />
                            </label>
                            {errors.email && <span className="crud-fieldError">{errors.email.message}</span>}

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
