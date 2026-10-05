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

    const { authUser, createPlant, dataError, loadingData, retryData } = useAuth();

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
            await createPlant({
                plant_name: values.plantName,
                genetic: values.genetic,
                grow_mode: values.growMode,
                auto: values.auto,
                germination_date: values.date,
            });
            isSuccess(true);
            setIsOpen(true);
            reset();
        } catch (error) {
            isSuccess(false);
            setErrmsg(error.message || 'Something went wrong while creating the plant.');
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

    if (!authUser) {
        return (
            <>
                <div className="crud-page">
                    <div className="container crud-shell">
                        <section className="crud-panel">
                            <div className="crud-panel__header">
                                <span className="section-label">Collection management</span>
                                <h1>Add a new plant</h1>
                                <p>{dataError || 'We are still loading your profile before creating a plant record.'}</p>
                                {dataError && <button className="crud-button crud-button--secondary" type="button" onClick={retryData} disabled={loadingData}>Retry loading</button>}
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
                            <h2 className="crud-side__title">A new beginning.</h2>
                            <p className="crud-side__copy">
                                Give your plant a name and record the details that follow it through the grow.
                            </p>
                        </div>

                        <div className="crud-side__list">
                            <article className="crud-side__item">
                                <strong>Cycle starts here</strong>
                                <p>The germination date unlocks age and harvest estimates throughout the app.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Grow mode matters</strong>
                                <p>Choose indoor or outdoor to record where this plant is growing.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Room in your garden</strong>
                                <p>Your new plant appears in the garden and in the classic collection.</p>
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
                                <span id="add-plant-name-label">Plant name</span>
                                <input type="text" placeholder="Lemon Haze" aria-labelledby="add-plant-name-label" aria-invalid={Boolean(errors.plantName)} aria-describedby={errors.plantName ? 'add-plant-name-error' : undefined} {...register('plantName')} />
                                {errors.plantName && <span id="add-plant-name-error" className="crud-fieldError" role="alert">{errors.plantName.message}</span>}
                            </label>

                            <div className="crud-formRow">
                                <label className="crud-field">
                                    <span id="add-plant-genetic-label">Genetic family</span>
                                    <select aria-labelledby="add-plant-genetic-label" aria-invalid={Boolean(errors.genetic)} aria-describedby={errors.genetic ? 'add-plant-genetic-error' : undefined} {...register('genetic')}>
                                        <option value="">Choose a family</option>
                                        <option value="Indica">Indica</option>
                                        <option value="Indica-dominating breed">Indica-dominating breed</option>
                                        <option value="Sativa">Sativa</option>
                                        <option value="Sativa-dominating breed">Sativa-dominating breed</option>
                                    </select>
                                    {errors.genetic && <span id="add-plant-genetic-error" className="crud-fieldError" role="alert">{errors.genetic.message}</span>}
                                </label>

                                <label className="crud-field">
                                    <span id="add-plant-grow-label">Grow mode</span>
                                    <select aria-labelledby="add-plant-grow-label" aria-invalid={Boolean(errors.growMode)} aria-describedby={errors.growMode ? 'add-plant-grow-error' : undefined} {...register('growMode')}>
                                        <option value="">Choose the grow mode</option>
                                        <option value="Exterior">Exterior</option>
                                        <option value="Interior">Interior</option>
                                    </select>
                                    {errors.growMode && <span id="add-plant-grow-error" className="crud-fieldError" role="alert">{errors.growMode.message}</span>}
                                </label>
                            </div>

                            <label className="crud-field">
                                <span id="add-plant-date-label">Germination date</span>
                                <input type="date" min="2022-09-01" aria-labelledby="add-plant-date-label" aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? 'add-plant-date-error' : undefined} {...register('date')} />
                                {errors.date && <span id="add-plant-date-error" className="crud-fieldError" role="alert">{errors.date.message}</span>}
                            </label>

                            <label className="crud-checkbox">
                                <div className="crud-checkbox__copy">
                                    <strong id="add-plant-auto-label">Autoflower</strong>
                                    <span id="add-plant-auto-help">Mark this plant as auto if the cycle does not depend on a photoperiod switch.</span>
                                    {errors.auto && <span id="add-plant-auto-error" className="crud-fieldError" role="alert">{errors.auto.message}</span>}
                                </div>
                                <input type="checkbox" aria-labelledby="add-plant-auto-label" aria-invalid={Boolean(errors.auto)} aria-describedby={errors.auto ? 'add-plant-auto-help add-plant-auto-error' : 'add-plant-auto-help'} {...register('auto')} />
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
