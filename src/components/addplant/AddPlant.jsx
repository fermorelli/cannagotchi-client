import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import '../crud.css';
import Modal from '../modal/modal';
import { schema } from './validations';
import { useAuth } from '../../context/authContext.jsx';
import { Footer } from '../footer/Footer';

export const AddPlant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [success, isSuccess] = useState(false);
    const [errmsg, setErrmsg] = useState('');

    const { authUser, setChange } = useAuth();
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
            plantName: '',
            genetic: '',
            growMode: '',
            date: '',
            auto: false,
        },
    });

    const onSubmit = async (values) => {
        setErrmsg('');

        try {
            const response = await fetch(`${back}plants`, {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                    'Access-Control-Allow-Origin': 'https://localhost:3000',
                },
                body: JSON.stringify({
                    user_id: authUser._id,
                    plant_name: values.plantName,
                    genetic: values.genetic,
                    grow_mode: values.growMode,
                    auto: values.auto,
                    germination_date: values.date,
                }),
            });

            const data = await response.json();

            if (data.error === false) {
                isSuccess(true);
                setIsOpen(true);
                setChange(true);
                reset();
                return;
            }

            isSuccess(false);
            setErrmsg('The plant could not be created. Please try again.');
        } catch (error) {
            console.log(error.message);
            isSuccess(false);
            setErrmsg('Something went wrong while creating the plant.');
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setChange(false);
    };

    const addAnother = () => {
        setIsOpen(false);
        isSuccess(false);
        reset();
        setChange(false);
    };

    if (!authUser) {
        return (
            <>
                <div className="crud-page">
                    <div className="container crud-shell">
                        <section className="crud-panel">
                            <div className="crud-panel__header">
                                <span className="section-label">Collection management</span>
                                <h1>Add a new plant</h1>
                                <p>We are still loading your profile before creating a plant record.</p>
                            </div>
                        </section>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            {isOpen && (
                <Modal setIsOpen={setIsOpen} handleClose={handleClose} modalTitle={success ? 'Plant created' : 'Something went wrong'}>
                    <p>{success ? 'The plant was added to your collection successfully.' : 'Please review the data and try again.'}</p>
                    <div className="crud-modalActions">
                        <Link className="crud-modalPrimary" to="/plants" onClick={handleClose}>
                            View collection
                        </Link>
                        <button type="button" className="crud-modalSecondary" onClick={addAnother}>
                            Add another plant
                        </button>
                    </div>
                </Modal>
            )}

            <div className="crud-page">
                <div className="container crud-shell">
                    <aside className="crud-side">
                        <div>
                            <span className="section-label crud-side__eyebrow">New plant record</span>
                            <h1 className="crud-side__title">Start a cleaner timeline for the next plant in your grow.</h1>
                            <p className="crud-side__copy">
                                Add the plant once with its core details and the rest of the collection becomes easier to scan and compare.
                            </p>
                        </div>

                        <div className="crud-side__list">
                            <article className="crud-side__item">
                                <strong>Cycle starts here</strong>
                                <p>The germination date unlocks age and harvest estimates throughout the app.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Grow mode matters</strong>
                                <p>Indoor and outdoor records stay readable when each plant starts with clear metadata.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Cleaner comparisons later</strong>
                                <p>Good structure now makes future runs easier to understand and review.</p>
                            </article>
                        </div>
                    </aside>

                    <section className="crud-panel">
                        <div className="crud-panel__header">
                            <span className="section-label">Collection management</span>
                            <h1>Add a new plant</h1>
                            <p>Create a fresh plant record with the fields that matter most to the cycle.</p>
                        </div>

                        {errmsg && <div className="crud-alert">{errmsg}</div>}

                        <form className="crud-form" onSubmit={handleSubmit(onSubmit)}>
                            <label className="crud-field">
                                <span>Plant name</span>
                                <input type="text" placeholder="Lemon Haze" {...register('plantName')} />
                            </label>
                            {errors.plantName && <span className="crud-fieldError">{errors.plantName.message}</span>}

                            <div className="crud-formRow">
                                <label className="crud-field">
                                    <span>Genetic family</span>
                                    <select {...register('genetic')}>
                                        <option value="">Choose a family</option>
                                        <option value="Indica">Indica</option>
                                        <option value="Indica-dominating breed">Indica-dominating breed</option>
                                        <option value="Sativa">Sativa</option>
                                        <option value="Sativa-dominating breed">Sativa-dominating breed</option>
                                    </select>
                                </label>

                                <label className="crud-field">
                                    <span>Grow mode</span>
                                    <select {...register('growMode')}>
                                        <option value="">Choose the grow mode</option>
                                        <option value="Exterior">Exterior</option>
                                        <option value="Interior">Interior</option>
                                    </select>
                                </label>
                            </div>
                            {errors.genetic && <span className="crud-fieldError">{errors.genetic.message}</span>}
                            {errors.growMode && <span className="crud-fieldError">{errors.growMode.message}</span>}

                            <label className="crud-field">
                                <span>Germination date</span>
                                <input type="date" min="2022-09-01" {...register('date')} />
                            </label>
                            {errors.date && <span className="crud-fieldError">{errors.date.message}</span>}

                            <label className="crud-checkbox">
                                <div className="crud-checkbox__copy">
                                    <strong>Autoflower</strong>
                                    <span>Mark this plant as auto if the cycle does not depend on a photoperiod switch.</span>
                                </div>
                                <input type="checkbox" {...register('auto')} />
                            </label>

                            <div className="crud-actions">
                                <button className="crud-button crud-button--primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating plant...' : 'Create plant'}
                                </button>
                                <Link className="crud-button crud-button--secondary" to="/plants">
                                    Back to plants
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
