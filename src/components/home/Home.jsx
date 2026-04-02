import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsFillPencilFill } from 'react-icons/bs';
import { FiArrowRight, FiClock, FiTrendingUp } from 'react-icons/fi';
import { GiOakLeaf } from 'react-icons/gi';
import './home.css';
import '../workspace.css';
import { useAuth } from '../../context/authContext.jsx';
import { Footer } from '../footer/Footer';
import { formatPlantDate, getDaysUntilHarvest, getEstimatedHarvestDate, isAutoflower } from '../../utils/plants';

export const Home = () => {
    const [myPlants, setMyPlants] = useState([]);

    const { user, authUser, plants } = useAuth();

    useEffect(() => {
        if (!plants || !authUser?._id) {
            setMyPlants([]);
            return;
        }

        setMyPlants(plants.filter((plant) => plant.user_id === authUser._id));
    }, [plants, authUser]);

    const indoorPlants = myPlants.filter((plant) => plant.grow_mode === 'Interior').length;
    const outdoorPlants = myPlants.filter((plant) => plant.grow_mode === 'Exterior').length;
    const autoflowerPlants = myPlants.filter((plant) => isAutoflower(plant.auto)).length;
    const oldestPlant = [...myPlants].sort((left, right) => new Date(left.germination_date) - new Date(right.germination_date))[0];

    const nextHarvestEntry = myPlants
        .map((plant) => ({
            plant,
            daysUntilHarvest: getDaysUntilHarvest(plant),
        }))
        .filter((entry) => entry.daysUntilHarvest !== null)
        .sort((left, right) => {
            const leftIsUpcoming = left.daysUntilHarvest >= 0;
            const rightIsUpcoming = right.daysUntilHarvest >= 0;

            if (leftIsUpcoming && !rightIsUpcoming) {
                return -1;
            }

            if (!leftIsUpcoming && rightIsUpcoming) {
                return 1;
            }

            if (leftIsUpcoming && rightIsUpcoming) {
                return left.daysUntilHarvest - right.daysUntilHarvest;
            }

            return Math.abs(left.daysUntilHarvest) - Math.abs(right.daysUntilHarvest);
        })[0];

    const nextHarvestDate = nextHarvestEntry ? getEstimatedHarvestDate(nextHarvestEntry.plant) : null;
    const nextHarvestLabel = nextHarvestEntry
        ? nextHarvestEntry.daysUntilHarvest >= 0
            ? `${nextHarvestEntry.daysUntilHarvest} day${nextHarvestEntry.daysUntilHarvest === 1 ? '' : 's'} away`
            : 'Inside harvest window'
        : 'No estimate available yet';

    if (!user || !authUser) {
        return (
            <>
                <div className="workspace-page">
                    <div className="container workspace-stack">
                        <section className="workspace-panel">
                            <div className="workspace-panel__header">
                                <div>
                                    <span className="section-label">Preparing workspace</span>
                                    <h1 className="workspace-panel__title">Loading your dashboard</h1>
                                </div>
                            </div>
                            <p>We are pulling your profile and plant records.</p>
                        </section>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <div className="workspace-page">
                <div className="container workspace-stack">
                    <section className="workspace-hero">
                        <div className="workspace-hero__copy">
                            <span className="section-label workspace-kicker">Personal grow dashboard</span>
                            <h1 className="workspace-title">
                                Welcome back, {authUser.firstName}. Your grow is looking organized.
                            </h1>
                            <p className="workspace-subtitle">
                                Review your collection, jump into the next plant that needs attention, and keep your records easy to
                                revisit.
                            </p>

                            <div className="workspace-actions">
                                <Link className="workspace-button workspace-button--primary" to="/add-plant">
                                    Add new plant
                                    <FiArrowRight />
                                </Link>
                                <Link className="workspace-button workspace-button--secondary" to="/plants">
                                    View collection
                                </Link>
                                <Link className="workspace-button workspace-button--secondary" to={`/edit-user/${authUser._id}`}>
                                    Edit profile
                                </Link>
                            </div>
                        </div>

                        <div className="workspace-metrics">
                            <article className="workspace-metric">
                                <span>Total plants</span>
                                <strong>{myPlants.length}</strong>
                                <small>{myPlants.length === 1 ? 'One active record in your grow log.' : 'Tracked in your current collection.'}</small>
                            </article>

                            <article className="workspace-metric">
                                <span>Indoor vs outdoor</span>
                                <strong>{indoorPlants}/{outdoorPlants}</strong>
                                <small>Indoor plants first, outdoor plants second.</small>
                            </article>

                            <article className="workspace-metric">
                                <span>Next harvest estimate</span>
                                <strong>{nextHarvestDate ? formatPlantDate(nextHarvestDate) : 'No date yet'}</strong>
                                <small>{nextHarvestEntry ? nextHarvestEntry.plant.plant_name : 'Add a plant to start seeing projections.'}</small>
                            </article>
                        </div>
                    </section>

                    <div className="home-grid">
                        <section className="workspace-panel home-profilePanel">
                            <div className="workspace-panel__header">
                                <div>
                                    <span className="workspace-card__eyebrow">Profile snapshot</span>
                                    <h2 className="workspace-panel__title">Your personal profile</h2>
                                </div>
                                <Link className="workspace-iconButton" to={`/edit-user/${authUser._id}`} aria-label="Edit profile">
                                    <BsFillPencilFill />
                                </Link>
                            </div>

                            <div className="home-profileHeader">
                                <div className="workspace-avatar">
                                    {authUser.firstName?.[0]}
                                    {authUser.lastName?.[0]}
                                </div>
                                <div>
                                    <strong className="home-profileName">
                                        {authUser.firstName} {authUser.lastName}
                                    </strong>
                                    <p className="workspace-note">{authUser.email}</p>
                                </div>
                            </div>

                            <div className="workspace-keyValueList">
                                <div className="workspace-keyValue">
                                    <span>First name</span>
                                    <strong>{authUser.firstName}</strong>
                                </div>
                                <div className="workspace-keyValue">
                                    <span>Last name</span>
                                    <strong>{authUser.lastName}</strong>
                                </div>
                                <div className="workspace-keyValue">
                                    <span>Email</span>
                                    <strong>{authUser.email}</strong>
                                </div>
                            </div>
                        </section>

                        <div className="home-sidebar">
                            <article className="workspace-actionCard">
                                <span className="workspace-card__eyebrow">What to review now</span>
                                <h2 className="workspace-actionCard__title">Cycle overview</h2>
                                <p>
                                    {nextHarvestEntry
                                        ? `${nextHarvestEntry.plant.plant_name} is your closest harvest estimate.`
                                        : 'Add your first plant to start building a timeline.'}
                                </p>
                                <div className="home-highlights">
                                    <div className="home-highlight">
                                        <FiClock />
                                        <div>
                                            <strong>Next harvest</strong>
                                            <span>{nextHarvestLabel}</span>
                                        </div>
                                    </div>
                                    <div className="home-highlight">
                                        <FiTrendingUp />
                                        <div>
                                            <strong>Autoflower records</strong>
                                            <span>{autoflowerPlants} currently marked as auto.</span>
                                        </div>
                                    </div>
                                    <div className="home-highlight">
                                        <GiOakLeaf />
                                        <div>
                                            <strong>Latest action</strong>
                                            <span>{myPlants.length > 0 ? 'Review the collection and keep notes fresh.' : 'Create your first plant record.'}</span>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <article className="workspace-actionCard">
                                <span className="workspace-card__eyebrow">Quick actions</span>
                                <h2 className="workspace-actionCard__title">Keep the routine moving</h2>
                                <div className="workspace-inlineActions">
                                    <Link className="workspace-button workspace-button--primary" to="/plants">
                                        Open plants
                                    </Link>
                                    <Link className="workspace-button workspace-button--secondary" to="/add-plant">
                                        Add plant
                                    </Link>
                                </div>
                                <p className="workspace-note">
                                    {myPlants.length > 0
                                        ? `Your earliest germination date is ${formatPlantDate(oldestPlant?.germination_date)}.`
                                        : 'The dashboard gets richer as soon as you add the first plant.'}
                                </p>
                            </article>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};
