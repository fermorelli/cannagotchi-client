import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPlus } from 'react-icons/fi';
import './plants.css';
import '../workspace.css';
import { useAuth } from '../../context/authContext.jsx';
import { Footer } from '../footer/Footer';
import { formatPlantDate, getEstimatedHarvestDate, getPlantAgeInDays, getPlantStageLabel, isAutoflower } from '../../utils/plants';

export const Plants = () => {
    const [myPlants, setMyPlants] = useState([]);
    const { plants, authUser } = useAuth();

    useEffect(() => {
        if (!plants || !authUser?._id) {
            setMyPlants([]);
            return;
        }

        setMyPlants(plants.filter((plant) => plant.user_id === authUser._id));
    }, [plants, authUser]);

    const sortedPlants = [...myPlants].sort((left, right) => new Date(right.germination_date) - new Date(left.germination_date));
    const indoorPlants = sortedPlants.filter((plant) => plant.grow_mode === 'Interior').length;
    const outdoorPlants = sortedPlants.filter((plant) => plant.grow_mode === 'Exterior').length;
    const autoPlants = sortedPlants.filter((plant) => isAutoflower(plant.auto)).length;

    return (
        <>
            <div className="workspace-page">
                <div className="container workspace-stack">
                    <section className="workspace-hero">
                        <div className="workspace-hero__copy">
                            <span className="section-label workspace-kicker">Plant collection</span>
                            <h1 className="workspace-title">Every plant in one cleaner, easier-to-scan board.</h1>
                            <p className="workspace-subtitle">
                                Review genetics, cycle age, grow mode, and harvest timing without bouncing through scattered notes.
                            </p>

                            <div className="workspace-actions">
                                <Link className="workspace-button workspace-button--primary" to="/add-plant">
                                    <FiPlus />
                                    Add new plant
                                </Link>
                                <Link className="workspace-button workspace-button--secondary" to="/home">
                                    Back to dashboard
                                </Link>
                            </div>
                        </div>

                        <div className="workspace-metrics">
                            <article className="workspace-metric">
                                <span>Total records</span>
                                <strong>{sortedPlants.length}</strong>
                                <small>{sortedPlants.length === 1 ? 'One plant currently tracked.' : 'Plants currently in your collection.'}</small>
                            </article>
                            <article className="workspace-metric">
                                <span>Indoor vs outdoor</span>
                                <strong>{indoorPlants}/{outdoorPlants}</strong>
                                <small>Indoor plants first, outdoor plants second.</small>
                            </article>
                            <article className="workspace-metric">
                                <span>Autoflower entries</span>
                                <strong>{autoPlants}</strong>
                                <small>Records currently marked as auto.</small>
                            </article>
                        </div>
                    </section>

                    {sortedPlants.length === 0 ? (
                        <section className="workspace-empty">
                            <span className="section-label">Nothing here yet</span>
                            <h2 className="workspace-empty__title">Your collection is ready for the first plant.</h2>
                            <p>Add the first record and the board will start showing dates, stages, and harvest estimates.</p>
                            <div className="workspace-empty__actions">
                                <Link className="workspace-button workspace-button--primary" to="/add-plant">
                                    Add your first plant
                                </Link>
                            </div>
                        </section>
                    ) : (
                        <section className="workspace-grid plants-grid">
                            {sortedPlants.map((plant) => {
                                const plantAge = getPlantAgeInDays(plant.germination_date);
                                const stage = getPlantStageLabel(plantAge);
                                const estimatedHarvest = getEstimatedHarvestDate(plant);

                                return (
                                    <Link key={plant._id} className="plants-cardLink" to={`/plants/${plant._id}`}>
                                        <article className="workspace-card plants-card">
                                            <div className="workspace-card__header">
                                                <div>
                                                    <span className="workspace-card__eyebrow">Started {formatPlantDate(plant.germination_date)}</span>
                                                    <h2 className="plants-card__title">{plant.plant_name}</h2>
                                                </div>
                                                <span className="workspace-pill">{stage}</span>
                                            </div>

                                            <div className="plants-card__chips">
                                                <span className="workspace-pill workspace-pill--soft">{plant.genetic}</span>
                                                <span className="workspace-pill workspace-pill--soft">{plant.grow_mode}</span>
                                                <span className="workspace-pill workspace-pill--warm">
                                                    {isAutoflower(plant.auto) ? 'Autoflower' : 'Photoperiod'}
                                                </span>
                                            </div>

                                            <div className="plants-card__details">
                                                <div className="workspace-keyValue">
                                                    <span>Age</span>
                                                    <strong>{plantAge} days</strong>
                                                </div>
                                                <div className="workspace-keyValue">
                                                    <span>Estimated harvest</span>
                                                    <strong>{estimatedHarvest ? formatPlantDate(estimatedHarvest) : 'Not available'}</strong>
                                                </div>
                                            </div>

                                            <div className="plants-card__footer">
                                                <span>Open plant record</span>
                                                <FiArrowRight />
                                            </div>
                                        </article>
                                    </Link>
                                );
                            })}
                        </section>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};
