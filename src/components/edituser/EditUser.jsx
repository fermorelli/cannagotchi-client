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
                            <h1 className="crud-side__title">Refine the profile without breaking the clean structure.</h1>
                            <p className="crud-side__copy">
                                Keep profile records updated so names, emails, and access details stay consistent across the app.
                            </p>
                        </div>

                        <div className="crud-side__list">
                            <article className="crud-side__item">
                                <strong>Readable user list</strong>
                                <p>Accurate profile data makes the management screens much easier to scan later.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Quick corrections</strong>
                                <p>Update the details here and return straight to the list view when you are done.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Consistent account records</strong>
                                <p>Editing inside the same visual system keeps the admin flow feeling much more polished.</p>
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
                                            <span>First name</span>
                                            <input type="text" {...register('firstName')} />
                                        </label>
                                        <label className="crud-field">
                                            <span>Last name</span>
                                            <input type="text" {...register('lastName')} />
                                        </label>
                                    </div>
                                    {errors.firstName && <span className="crud-fieldError">{errors.firstName.message}</span>}
                                    {errors.lastName && <span className="crud-fieldError">{errors.lastName.message}</span>}

                                    <label className="crud-field">
                                        <span>Email</span>
                                        <input type="email" {...register('email')} />
                                    </label>
                                    {errors.email && <span className="crud-fieldError">{errors.email.message}</span>}

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
