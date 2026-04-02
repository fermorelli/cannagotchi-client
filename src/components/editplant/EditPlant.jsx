import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import '../crud.css';
import Modal from '../modal/modal';
import { schema } from './validations';
import { useAuth } from '../../context/authContext.jsx';
import { Footer } from '../footer/Footer';

export const EditPlant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [success, isSuccess] = useState(false);
    const [errmsg, setErrmsg] = useState('');
    const [loaded, setLoaded] = useState(false);

    const { authUser, setEdit } = useAuth();
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
            plantName: '',
            genetic: '',
            growMode: '',
            date: '',
            auto: false,
        },
    });

    useEffect(() => {
        const getPlant = async () => {
            try {
                const response = await fetch(`${back}plants/${id}`);
                const data = await response.json();
                const plant = data.data;

                reset({
                    plantName: plant?.plant_name || '',
                    genetic: plant?.genetic || '',
                    growMode: plant?.grow_mode || '',
                    date: plant?.germination_date ? plant.germination_date.slice(0, 10) : '',
                    auto: Boolean(plant?.auto),
                });
                setLoaded(true);
            } catch (error) {
                console.log(error.message);
            }
        };

        getPlant();
    }, [id, reset]);

    const onSubmit = async (values) => {
        setErrmsg('');

        try {
            const response = await fetch(`${back}plants/${id}`, {
                method: 'PUT',
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
                setEdit(true);
                return;
            }

            isSuccess(false);
            setErrmsg('The plant could not be updated. Please try again.');
        } catch (error) {
            console.log(error.message);
            isSuccess(false);
            setErrmsg('Something went wrong while updating the plant.');
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setEdit(false);
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
                                <p>We are still loading your profile before saving this plant record.</p>
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
                            <h1 className="crud-side__title">Tune the record without losing the clean cycle view.</h1>
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
                                <strong>Metadata keeps cards readable</strong>
                                <p>Genetics and grow mode are some of the first details you scan in the collection board.</p>
                            </article>
                            <article className="crud-side__item">
                                <strong>Use edits to keep the history clean</strong>
                                <p>The better maintained each record is, the more useful the whole grow log becomes.</p>
                            </article>
                        </div>
                    </aside>

                    <section className="crud-panel">
                        <div className="crud-panel__header">
                            <span className="section-label">Collection management</span>
                            <h1>Edit plant</h1>
                            <p>Adjust the current plant details directly and keep the record aligned with the real cycle.</p>
                        </div>

                        {!loaded ? (
                            <p className="crud-helper">Loading plant data...</p>
                        ) : (
                            <>
                                {errmsg && <div className="crud-alert">{errmsg}</div>}

                                <form className="crud-form" onSubmit={handleSubmit(onSubmit)}>
                                    <label className="crud-field">
                                        <span>Plant name</span>
                                        <input type="text" {...register('plantName')} />
                                    </label>
                                    {errors.plantName && <span className="crud-fieldError">{errors.plantName.message}</span>}

                                    <div className="crud-formRow">
                                        <label className="crud-field">
                                            <span>Genetic family</span>
                                            <select {...register('genetic')}>
                                                <option value="Indica">Indica</option>
                                                <option value="Indica-dominating breed">Indica-dominating breed</option>
                                                <option value="Sativa">Sativa</option>
                                                <option value="Sativa-dominating breed">Sativa-dominating breed</option>
                                            </select>
                                        </label>

                                        <label className="crud-field">
                                            <span>Grow mode</span>
                                            <select {...register('growMode')}>
                                                <option value="Exterior">Exterior</option>
                                                <option value="Interior">Interior</option>
                                            </select>
                                        </label>
                                    </div>
                                    {errors.genetic && <span className="crud-fieldError">{errors.genetic.message}</span>}
                                    {errors.growMode && <span className="crud-fieldError">{errors.growMode.message}</span>}

                                    <label className="crud-field">
                                        <span>Germination date</span>
                                        <input type="date" {...register('date')} />
                                    </label>
                                    {errors.date && <span className="crud-fieldError">{errors.date.message}</span>}

                                    <label className="crud-checkbox">
                                        <div className="crud-checkbox__copy">
                                            <strong>Autoflower</strong>
                                            <span>Toggle this if the plant should be tracked as an autoflower record.</span>
                                        </div>
                                        <input type="checkbox" {...register('auto')} />
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
