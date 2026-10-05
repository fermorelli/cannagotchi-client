import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BsFillPencilFill } from 'react-icons/bs';
import { FiArrowLeft, FiClock, FiDroplet, FiScissors } from 'react-icons/fi';
import { GoTrashcan } from 'react-icons/go';
import './singleplant.css';
import '../workspace.css';
import Modal from '../modal/modal';
import { Footer } from '../footer/Footer';
import { useAuth } from '../../context/authContext.jsx';
import { PlantJournal } from '../care/PlantJournal';
import { HarvestPlant } from '../garden/HarvestPlant';
import { useCare } from '../../context/careContext';
import {
    formatPlantDate,
    getDaysUntilHarvest,
    getEstimatedHarvestDate,
    getPlantAgeInDays,
    getPlantStageLabel,
    isAutoflower,
} from '../../utils/plants';
import spriteSeedling from '../../assets/sprites/sprite 1.jpg';
import spriteVegetative from '../../assets/sprites/sprite 2.jpg';
import spriteGrowing from '../../assets/sprites/sprite 3.jpg';
import spriteFlowering from '../../assets/sprites/sprite 4.jpg';
import spriteHarvest from '../../assets/sprites/sprite 5.jpg';

const getPlantSprite = (ageInDays) => {
    if (ageInDays <= 14) {
        return spriteSeedling;
    }

    if (ageInDays <= 60) {
        return spriteVegetative;
    }

    if (ageInDays <= 95) {
        return spriteGrowing;
    }

    if (ageInDays <= 140) {
        return spriteFlowering;
    }

    return spriteHarvest;
};

export const SinglePlant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [deletedPlant, setDeletedPlant] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [errmsg, setErrmsg] = useState('');
    const [harvestingPlant, setHarvestingPlant] = useState(null);

    const { plants, authUser, deletePlant, dataError, loadingData, retryData, isLocalMode } = useAuth();
    const { getStage } = useCare();
    const { id } = useParams();
    const navigate = useNavigate();
    const currentPlant = plants.find((item) => item._id === id && item.user_id === authUser?._id);
    const retainedPlant = deletedPlant || harvestingPlant;
    const plant = currentPlant || (retainedPlant?._id === id && retainedPlant?.user_id === authUser?._id ? retainedPlant : null);

    useEffect(() => {
        setIsOpen(false);
        setConfirm(false);
        setDeletedPlant(null);
        setErrmsg('');
        setHarvestingPlant(null);
    }, [id, authUser?._id, isLocalMode]);

    const finishHarvest = useCallback(() => {
        setHarvestingPlant(null);
        navigate('/plants', { replace: true });
    }, [navigate]);

    const plantAge = getPlantAgeInDays(plant?.germination_date);
    const stageLabel = getPlantStageLabel(plantAge);
    const estimatedHarvestDate = getEstimatedHarvestDate(plant);
    const daysUntilHarvest = getDaysUntilHarvest(plant);
    const sprite = getPlantSprite(plantAge);

    const harvestMessage = (() => {
        if (daysUntilHarvest === null) {
            return 'Add core dates to unlock a harvest estimate.';
        }

        if (daysUntilHarvest >= 0) {
            return `${daysUntilHarvest} day${daysUntilHarvest === 1 ? '' : 's'} until the estimated harvest window.`;
        }

        return 'This plant is already inside the estimated harvest window.';
    })();

    const openDeleteModal = () => {
        setConfirm(false);
        setErrmsg('');
        setIsOpen(true);
    };

    const handleClose = () => {
        if (deleting) return;
        setIsOpen(false);
        setConfirm(false);
        setDeletedPlant(null);
        setErrmsg('');
        if (confirm) navigate('/plants');
    };

    const handleDelete = async () => {
        if (deleting) return;
        setDeleting(true);
        setErrmsg('');
        setDeletedPlant(plant);
        try {
            await deletePlant(id);
            setConfirm(true);
        } catch (error) {
            setDeletedPlant(null);
            setErrmsg(error.message || 'The plant could not be deleted. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    if (!plant) {
        return (
            <>
                <div className="workspace-page">
                    <div className="container workspace-stack">
                        <section className="workspace-panel">
                            <div className="workspace-panel__header">
                                <div>
                                    <span className="section-label">Plant record</span>
                                    <h1 className="workspace-panel__title">{loadingData ? 'Loading plant details' : 'Plant unavailable'}</h1>
                                </div>
                            </div>
                            <p>{dataError || (loadingData ? 'We are pulling the latest information for this plant.' : 'This plant was not found in your collection.')}</p>
                            {dataError && <button type="button" className="workspace-button workspace-button--secondary" onClick={retryData} disabled={loadingData}>Retry loading</button>}
                            <Link className="workspace-button workspace-button--secondary" to="/plants">Back to plants</Link>
                        </section>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            {harvestingPlant && (
                <HarvestPlant
                    plant={harvestingPlant}
                    onCancel={() => setHarvestingPlant(null)}
                    onHarvested={finishHarvest}
                    returnLabel="Back to plants"
                    headingLabel="PLANT RECORD"
                    closeLabel="Close harvest dialog"
                />
            )}
            {isOpen && (
                <Modal
                    setIsOpen={setIsOpen}
                    handleClose={handleClose}
                    modalTitle={!confirm ? 'Delete this plant?' : 'Plant deleted'}
                >
                    <p>
                        {!confirm
                            ? `This will remove ${plant.plant_name} from your collection and it cannot be undone.`
                            : `${plant.plant_name} was removed from your collection.`}
                    </p>
                    {errmsg && <p role="alert">{errmsg}</p>}
                    <div className="workspace-inlineActions singleplant-modalActions">
                        {!confirm ? (
                            <>
                                <button type="button" className="workspace-button workspace-button--danger" onClick={handleDelete} disabled={deleting}>
                                    {deleting ? 'Deleting plant...' : 'Delete plant'}
                                </button>
                                <button type="button" className="workspace-button workspace-button--secondary" onClick={handleClose} disabled={deleting}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <Link className="workspace-button workspace-button--primary" to="/plants" onClick={handleClose}>
                                Back to plants
                            </Link>
                        )}
                    </div>
                </Modal>
            )}

            <div className="workspace-page">
                <div className="container workspace-stack">
                    <button type="button" className="workspace-backLink singleplant-back" onClick={() => navigate(-1)}>
                        <FiArrowLeft />
                        Go back
                    </button>

                    <section className="workspace-hero singleplant-hero">
                        <div className="singleplant-visual">
                            <div className="singleplant-visual__frame">
                                <img src={sprite} alt={`${plant.plant_name} visual stage`} />
                            </div>
                            <div className="singleplant-visual__caption">
                                <span className="workspace-card__eyebrow">Current stage</span>
                                <strong>{stageLabel}</strong>
                                <p>{plantAge} days since germination.</p>
                            </div>
                        </div>

                        <div className="singleplant-summary">
                            <span className="section-label workspace-kicker">Plant record</span>
                            <h1 className="workspace-title">{plant.plant_name}</h1>
                            <p className="workspace-subtitle">
                                Grow details, important dates and care notes for this plant.
                            </p>

                            <dl className="singleplant-details">
                                <div><dt>Genetics</dt><dd>{plant.genetic}</dd></div>
                                <div><dt>Grow mode</dt><dd>{plant.grow_mode}</dd></div>
                                <div><dt>Cycle</dt><dd>{isAutoflower(plant.auto) ? 'Autoflower' : 'Photoperiod'}</dd></div>
                            </dl>

                            <div className="workspace-actions">
                                <Link className="workspace-button workspace-button--primary" to={`/edit-plant/${plant._id}`}>
                                    <BsFillPencilFill />
                                    Edit plant
                                </Link>
                                <button type="button" className="workspace-button singleplant-harvest" disabled={!currentPlant || deleting} onClick={() => setHarvestingPlant({ ...currentPlant, visualStage: getStage(currentPlant._id) })}>
                                    <FiScissors />
                                    Harvest plant
                                </button>
                                <button type="button" className="workspace-button workspace-button--danger" onClick={openDeleteModal} disabled={!currentPlant}>
                                    <GoTrashcan />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="singleplant-grid">
                        <section className="workspace-panel">
                            <div className="workspace-panel__header">
                                <div>
                                    <span className="workspace-card__eyebrow">Cycle overview</span>
                                    <h2 className="workspace-panel__title">Key dates and timing</h2>
                                </div>
                            </div>

                            <div className="singleplant-stats">
                                <article className="singleplant-stat">
                                    <span>Germinated</span>
                                    <strong>{formatPlantDate(plant.germination_date)}</strong>
                                </article>
                                <article className="singleplant-stat">
                                    <span>Age</span>
                                    <strong>{plantAge} days</strong>
                                </article>
                                <article className="singleplant-stat">
                                    <span>Estimated harvest</span>
                                    <strong>{estimatedHarvestDate ? formatPlantDate(estimatedHarvestDate) : 'Not available'}</strong>
                                </article>
                                <article className="singleplant-stat">
                                    <span>Harvest window</span>
                                    <strong>{daysUntilHarvest === null ? 'Pending' : daysUntilHarvest >= 0 ? `${daysUntilHarvest} days left` : 'Open now'}</strong>
                                </article>
                            </div>
                        </section>

                        <section className="workspace-panel">
                            <div className="workspace-panel__header">
                                <div>
                                    <span className="workspace-card__eyebrow">Plant details</span>
                                    <h2 className="workspace-panel__title">Profile summary</h2>
                                </div>
                            </div>

                            <div className="workspace-keyValueList">
                                <div className="workspace-keyValue">
                                    <span>Plant name</span>
                                    <strong>{plant.plant_name}</strong>
                                </div>
                                <div className="workspace-keyValue">
                                    <span>Family</span>
                                    <strong>{plant.genetic}</strong>
                                </div>
                                <div className="workspace-keyValue">
                                    <span>Grow mode</span>
                                    <strong>{plant.grow_mode}</strong>
                                </div>
                                <div className="workspace-keyValue">
                                    <span>Auto</span>
                                    <strong>{isAutoflower(plant.auto) ? 'Yes' : 'No'}</strong>
                                </div>
                            </div>
                        </section>
                    </div>

                    {!confirm && currentPlant && <PlantJournal plant={plant} />}

                    <section className="workspace-actionCard">
                        <span className="workspace-card__eyebrow">Timeline note</span>
                        <h2 className="workspace-actionCard__title">Estimated harvest timing</h2>
                        <div className="singleplant-timeline">
                            <FiClock />
                            <div>
                                <strong>{estimatedHarvestDate ? formatPlantDate(estimatedHarvestDate) : 'No estimate yet'}</strong>
                                <p>{harvestMessage}</p>
                            </div>
                        </div>
                        <div className="singleplant-timeline">
                            <FiDroplet />
                            <div>
                                <strong>Keep the record updated</strong>
                                <p>Record care and observations in the notebook above as your plant grows.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
};
