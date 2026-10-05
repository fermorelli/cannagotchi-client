import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import '../crud.css';
import Modal from '../modal/modal';
import { schema } from './validations';
import { useAuth } from '../../context/authContext.jsx';
import { Footer } from '../footer/Footer';
import { isAutoflower } from '../../utils/plants';

export const EditPlant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [success, isSuccess] = useState(false);
    const [errmsg, setErrmsg] = useState('');
    const { authUser, plants, updatePlant, loadingData, dataError, retryData } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const plant = plants.find((item) => item._id === id && item.user_id === authUser?._id);

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

    useEffect(() => {
        if (!plant) return;
        reset({
            plantName: plant.plant_name || '',
            genetic: plant.genetic || '',
            growMode: plant.grow_mode || '',
            date: plant.germination_date ? plant.germination_date.slice(0, 10) : '',
            auto: isAutoflower(plant.auto),
        });
    }, [plant, reset]);

    const onSubmit = async (values) => {
        setErrmsg('');

        try {
            await updatePlant(id, {
                plant_name: values.plantName,
                genetic: values.genetic,
                grow_mode: values.growMode,
                auto: values.auto,
                germination_date: values.date,
            });
            isSuccess(true);
            setIsOpen(true);
        } catch (error) {
            isSuccess(false);
            setErrmsg(error.message || 'Something went wrong while updating the plant.');
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        navigate(-1);
    };

    if (!authUser) {
        return (
            <>
                <div className="crud-page">
                    <div className="container crud-shell">
                        <section className="crud-panel">
                            <div className="crud-panel__header">
                                <span className="section-label">Collection management</span>
                                <h1>Edit plant</h1>
                                <p>{dataError || 'We are still loading your profile before saving this plant record.'}</p>
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
                <Modal setIsOpen={setIsOpen} handleClose={handleClose} modalTitle={success ? 'Plant updated' : 'Something went wrong'}>
                    <p>{success ? 'The plant record was updated successfully.' : 'Please review the data and try again.'}</p>
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
                            <span className="section-label crud-side__eyebrow">Edit plant</span>
                            <h2 className="crud-side__title">Keep the story current.</h2>
                            <p className="crud-side__copy">
                                Keep dates, genetics, and grow mode up to date so the plant card and detail page stay trustworthy.
                            </p>
                        </div>

                        <div className="crud-side__list">
                            <article className="crud-side__item">
                                <strong>Dates affect estimates</strong>
                                <p>Small date changes have a big impact on the age and harvest projections shown elsewhere.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Plant details</strong>
                                <p>Update the name, genetics and grow mode when you learn something new.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Your care notes stay with the plant</strong>
                                <p>Watering, measurements and observations remain in the plant notebook.</p>
                            </article>
                        </div>
                    </aside>

                    <section className="crud-panel">
                        <div className="crud-panel__header">
                            <span className="section-label">Collection management</span>
                            <h1>Edit plant</h1>
                            <p>Adjust the current plant details directly and keep the record aligned with the real cycle.</p>
                        </div>

                        {!plant ? (
                            <div className="crud-helper">
                                <p>{dataError || (loadingData ? 'Loading plant data...' : 'This plant was not found in your collection.')}</p>
                                {dataError && <button className="crud-button crud-button--secondary" type="button" onClick={retryData} disabled={loadingData}>Retry loading</button>}
                                <Link className="crud-button crud-button--secondary" to="/plants">Back to plants</Link>
                            </div>
                        ) : (
                            <>
                                {errmsg && <div className="crud-alert">{errmsg}</div>}

                                <form className="crud-form" onSubmit={handleSubmit(onSubmit)}>
                                    <label className="crud-field">
                                        <span id="edit-plant-name-label">Plant name</span>
                                        <input type="text" aria-labelledby="edit-plant-name-label" aria-invalid={Boolean(errors.plantName)} aria-describedby={errors.plantName ? 'edit-plant-name-error' : undefined} {...register('plantName')} />
                                        {errors.plantName && <span id="edit-plant-name-error" className="crud-fieldError" role="alert">{errors.plantName.message}</span>}
                                    </label>

                                    <div className="crud-formRow">
                                        <label className="crud-field">
                                            <span id="edit-plant-genetic-label">Genetic family</span>
                                            <select aria-labelledby="edit-plant-genetic-label" aria-invalid={Boolean(errors.genetic)} aria-describedby={errors.genetic ? 'edit-plant-genetic-error' : undefined} {...register('genetic')}>
                                                <option value="Indica">Indica</option>
                                                <option value="Indica-dominating breed">Indica-dominating breed</option>
                                                <option value="Sativa">Sativa</option>
                                                <option value="Sativa-dominating breed">Sativa-dominating breed</option>
                                            </select>
                                            {errors.genetic && <span id="edit-plant-genetic-error" className="crud-fieldError" role="alert">{errors.genetic.message}</span>}
                                        </label>

                                        <label className="crud-field">
                                            <span id="edit-plant-grow-label">Grow mode</span>
                                            <select aria-labelledby="edit-plant-grow-label" aria-invalid={Boolean(errors.growMode)} aria-describedby={errors.growMode ? 'edit-plant-grow-error' : undefined} {...register('growMode')}>
                                                <option value="Exterior">Exterior</option>
                                                <option value="Interior">Interior</option>
                                            </select>
                                            {errors.growMode && <span id="edit-plant-grow-error" className="crud-fieldError" role="alert">{errors.growMode.message}</span>}
                                        </label>
                                    </div>

                                    <label className="crud-field">
                                        <span id="edit-plant-date-label">Germination date</span>
                                        <input type="date" aria-labelledby="edit-plant-date-label" aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? 'edit-plant-date-error' : undefined} {...register('date')} />
                                        {errors.date && <span id="edit-plant-date-error" className="crud-fieldError" role="alert">{errors.date.message}</span>}
                                    </label>

                                    <label className="crud-checkbox">
                                        <div className="crud-checkbox__copy">
                                            <strong id="edit-plant-auto-label">Autoflower</strong>
                                            <span id="edit-plant-auto-help">Toggle this if the plant should be tracked as an autoflower record.</span>
                                            {errors.auto && <span id="edit-plant-auto-error" className="crud-fieldError" role="alert">{errors.auto.message}</span>}
                                        </div>
                                        <input type="checkbox" aria-labelledby="edit-plant-auto-label" aria-invalid={Boolean(errors.auto)} aria-describedby={errors.auto ? 'edit-plant-auto-help edit-plant-auto-error' : 'edit-plant-auto-help'} {...register('auto')} />
                                    </label>

                                    <div className="crud-actions">
                                        <button className="crud-button crud-button--primary" type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Updating plant...' : 'Update plant'}
                                        </button>
                                        <button type="button" className="crud-button crud-button--secondary" onClick={() => navigate(-1)}>
                                            Go back
                                        </button>
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
