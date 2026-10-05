import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import '../crud.css';
import Modal from '../modal/modal';
import { schema } from './validations';
import { Footer } from '../footer/Footer';

export const EditUser = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [success, isSuccess] = useState(false);
    const [errmsg, setErrmsg] = useState('');
    const [loaded, setLoaded] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();
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

    useEffect(() => {
        localStorage.setItem('users-edit-mode', 'true');
    }, []);

    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await fetch(`${back}users/${id}`);
                const data = await response.json();

                reset({
                    firstName: data.data?.firstName || '',
                    lastName: data.data?.lastName || '',
                    email: data.data?.email || '',
                });
                setLoaded(true);
            } catch (error) {
                console.log(error.message);
            }
        };

        getUser();
    }, [id, reset]);

    const onSubmit = async (values) => {
        setErrmsg('');

        try {
            const response = await fetch(`${back}users/${id}`, {
                method: 'PUT',
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
                return;
            }

            isSuccess(false);
            setErrmsg('The user could not be updated. Please try again.');
        } catch (error) {
            console.log(error.message);
            isSuccess(false);
            setErrmsg('Something went wrong while updating the user.');
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        navigate(-1);
    };

    return (
        <>
            {isOpen && (
                <Modal setIsOpen={setIsOpen} handleClose={handleClose} modalTitle={success ? 'User updated' : 'Something went wrong'}>
                    <p>{success ? 'The user record was updated successfully.' : 'Please review the data and try again.'}</p>
                    <div className="crud-modalActions">
                        <button type="button" className="crud-modalPrimary" onClick={handleClose}>
                            Go back
                        </button>
                    </div>
                </Modal>
            )}

            <div className="crud-page">
                <div className="container crud-shell">
                    <aside className="crud-side">
                        <div>
                            <span className="section-label crud-side__eyebrow">Edit user</span>
                            <h2 className="crud-side__title">Make the details yours.</h2>
                            <p className="crud-side__copy">
                                Update this profile's name and email whenever the details change.
                            </p>
                        </div>

                        <div className="crud-side__list">
                            <article className="crud-side__item">
                                <strong>Profile name</strong>
                                <p>The name appears on the dashboard and in the user list.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Quick corrections</strong>
                                <p>Update the details here and return straight to the list view when you are done.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Review your changes</strong>
                                <p>Check the name and email before saving the updated profile.</p>
                            </article>
                        </div>
                    </aside>

                    <section className="crud-panel">
                        <div className="crud-panel__header">
                            <span className="section-label">User management</span>
                            <h1>Update user</h1>
                            <p>Adjust the profile details directly in place and keep the record current.</p>
                        </div>

                        {!loaded ? (
                            <p className="crud-helper">Loading user data...</p>
                        ) : (
                            <>
                                {errmsg && <div className="crud-alert">{errmsg}</div>}

                                <form className="crud-form" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="crud-formRow">
                                        <label className="crud-field">
                                            <span id="edit-user-first-label">First name</span>
                                            <input type="text" aria-labelledby="edit-user-first-label" aria-invalid={Boolean(errors.firstName)} aria-describedby={errors.firstName ? 'edit-user-first-error' : undefined} {...register('firstName')} />
                                            {errors.firstName && <span id="edit-user-first-error" className="crud-fieldError" role="alert">{errors.firstName.message}</span>}
                                        </label>
                                        <label className="crud-field">
                                            <span id="edit-user-last-label">Last name</span>
                                            <input type="text" aria-labelledby="edit-user-last-label" aria-invalid={Boolean(errors.lastName)} aria-describedby={errors.lastName ? 'edit-user-last-error' : undefined} {...register('lastName')} />
                                            {errors.lastName && <span id="edit-user-last-error" className="crud-fieldError" role="alert">{errors.lastName.message}</span>}
                                        </label>
                                    </div>

                                    <label className="crud-field">
                                        <span id="edit-user-email-label">Email</span>
                                        <input type="email" aria-labelledby="edit-user-email-label" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'edit-user-email-error' : undefined} {...register('email')} />
                                        {errors.email && <span id="edit-user-email-error" className="crud-fieldError" role="alert">{errors.email.message}</span>}
                                    </label>

                                    <div className="crud-actions">
                                        <button className="crud-button crud-button--primary" type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Updating user...' : 'Update user'}
                                        </button>
                                        <Link className="crud-button crud-button--secondary" to="/users">
                                            Back to users
                                        </Link>
                                    </div>
                                </form>
                            </>
                        )}
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
};
