import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BsFillPencilFill } from 'react-icons/bs';
import { FiArrowLeft, FiClock, FiDroplet } from 'react-icons/fi';
import { GoTrashcan } from 'react-icons/go';
import './singleplant.css';
import '../workspace.css';
import Modal from '../modal/modal';
import { Footer } from '../footer/Footer';
import { useAuth } from '../../context/authContext.jsx';
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
    const [plant, setPlant] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [confirm, setConfirm] = useState(false);

    const { isDeleted } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const back = '/api/';

    useEffect(() => {
        const getPlant = async () => {
            try {
                const response = await fetch(`${back}plants/${id}`, {
                    headers: {
                        'Access-Control-Allow-Origin': 'https://localhost:3000',
                    },
                });
                const data = await response.json();
                setPlant(data.data);
            } catch (error) {
                console.log(error.message);
            }
        };

        getPlant();
    }, [id]);

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
        setIsOpen(true);
    };

    const handleClose = () => {
        setIsOpen(false);
        setConfirm(false);
        isDeleted(false);
    };

    const deletePlant = async () => {
        try {
            const response = await fetch(`${back}plants/${id}`, { method: 'DELETE' });

            if (!response.ok) {
                throw new Error('Something went wrong');
            }

            isDeleted(true);
            setConfirm(true);
        } catch (error) {
            console.log(error.message);
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
                                    <h1 className="workspace-panel__title">Loading plant details</h1>
                                </div>
                            </div>
                            <p>We are pulling the latest information for this plant.</p>
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
                    <div className="workspace-inlineActions singleplant-modalActions">
                        {!confirm ? (
                            <>
                                <button type="button" className="workspace-button workspace-button--danger" onClick={deletePlant}>
                                    Delete plant
                                </button>
                                <button type="button" className="workspace-button workspace-button--secondary" onClick={handleClose}>
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
                                This record keeps the essentials visible so you can review the cycle quickly and make the next move with
                                more confidence.
                            </p>

                            <div className="singleplant-pills">
                                <span className="workspace-pill">{stageLabel}</span>
                                <span className="workspace-pill workspace-pill--soft">{plant.genetic}</span>
                                <span className="workspace-pill workspace-pill--soft">{plant.grow_mode}</span>
                                <span className="workspace-pill workspace-pill--warm">
                                    {isAutoflower(plant.auto) ? 'Autoflower' : 'Photoperiod'}
                                </span>
                            </div>

                            <div className="workspace-actions">
                                <Link className="workspace-button workspace-button--primary" to={`/edit-plant/${plant._id}`}>
                                    <BsFillPencilFill />
                                    Edit plant
                                </Link>
                                <button type="button" className="workspace-button workspace-button--danger" onClick={openDeleteModal}>
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
                                <p>The cleaner the dates and plant details are, the more helpful your cycle planning becomes.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
};
