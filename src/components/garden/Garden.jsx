import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowDown, FiArrowRight, FiBookOpen, FiCheck, FiGrid, FiPlus, FiScissors, FiSun } from 'react-icons/fi';
import { useAuth } from '../../context/authContext';
import { useCare } from '../../context/careContext';
import { PlantJournal } from '../care/PlantJournal';
import { formatPlantDate, getPlantAgeInDays, isAutoflower } from '../../utils/plants';
import { CARE_STAGES } from '../../utils/care';
import { GardenWorld } from './GardenWorld';
import { PlantSprite, getPlantVisualStage } from './sprites';
import './garden.css';
import { GardenDialog } from './GardenDialog';
import { HarvestPlant } from './HarvestPlant';

const stageLabel = (plant) => CARE_STAGES.find(({ value }) => value === getPlantVisualStage(plant))?.label || 'Growing';

function NewPlant({ onClose, onCreated }) {
    const { createPlant, authUser } = useAuth();
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [savedButUnavailable, setSavedButUnavailable] = useState(false);
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const submit = async (event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        const name = values.get('plant_name').trim();
        if (name.length < 3) { setError('Give your plant a name with at least 3 characters.'); return; }
        setSaving(true);
        setError('');
        try {
            const plant = await createPlant({
                user_id: authUser._id,
                plant_name: name,
                genetic: values.get('genetic'),
                grow_mode: values.get('grow_mode'),
                germination_date: values.get('germination_date'),
                auto: values.get('auto') === 'on',
            });
            onCreated(plant);
        } catch (err) { setError(err.message || 'Could not plant this seed. Try again.'); setSavedButUnavailable(Boolean(err.saved)); }
        finally { setSaving(false); }
    };
    return (
        <GardenDialog title="A new little beginning." onClose={onClose}>
            <p className="garden-dialog__intro">An empty pot, a new story. Add the same details you would in your plant collection.</p>
            <form className="garden-form" onSubmit={submit}>
                <label>Plant name<input name="plant_name" placeholder="Give your plant a name" minLength={3} maxLength={80} required data-autofocus /></label>
                <div className="garden-form__row">
                    <label>Genetic family<select name="genetic" required defaultValue=""><option value="" disabled>Choose a family</option><option>Indica</option><option>Sativa</option><option>Indica-dominating breed</option><option>Sativa-dominating breed</option></select></label>
                    <label>Grow mode<select name="grow_mode" required defaultValue="Exterior"><option value="Exterior">Outdoor</option><option value="Interior">Indoor</option></select></label>
                </div>
                <label>Germination date<input name="germination_date" type="date" defaultValue={date} max={date} required /></label>
                <label className="garden-form__check"><input name="auto" type="checkbox" /> Autoflower</label>
                {error && <p role="alert" className="garden-error">{error}</p>}
                <div className="garden-dialog__actions">{savedButUnavailable ? <Link to="/plants" className="garden-button">Open collection<FiArrowRight /></Link> : <button type="submit" className="garden-button" disabled={saving}>{saving ? 'Planting…' : 'Plant something'}<FiPlus /></button>}<button type="button" className="garden-button garden-button--quiet" onClick={onClose}>Cancel</button></div>
            </form>
        </GardenDialog>
    );
}

function GardenEntry() {
    const { startLocalGarden } = useAuth();
    const [error, setError] = useState('');
    const enter = () => { try { startLocalGarden(); } catch (err) { setError(err.message); } };
    return (
        <main className="garden-page garden-entry">
            <div className="garden-entry__art" aria-hidden="true"><span className="garden-entry__sun">✦</span><PlantSprite stage="sprout" size={180} /><PlantSprite stage="vegetative" size={220} /><PlantSprite stage="flowering" size={180} /></div>
            <span className="garden-eyebrow">WELCOME TO YOUR LITTLE GREEN WORLD</span>
            <h1>A little room to grow.</h1>
            <p>Walk through a tiny garden. Visit your plants. Keep their stories.<br />Your plant tracker, with a little more life.</p>
            <div className="garden-entry__actions"><button className="garden-button" onClick={enter}>Start a local garden<FiArrowRight /></button><Link className="garden-button garden-button--quiet" to="/login">Log in to my collection</Link></div>
            <p className="garden-entry__note">The local garden starts with three example plants. Changes stay in this browser. Your account collection stays separate.</p>
            {error && <p role="alert" className="garden-error">{error}</p>}
        </main>
    );
}

export function Garden() {
    const { user, authUser, plants, initializing, loadingData, dataError, isLocalMode } = useAuth();
    const { getEntries, getStage } = useCare();
    const [visiting, setVisiting] = useState(null);
    const [planting, setPlanting] = useState(false);
    const [harvesting, setHarvesting] = useState(null);
    const [watered, setWatered] = useState(null);
    const [notice, setNotice] = useState('');
    const plantListRef = useRef(null);
    const [listOverflows, setListOverflows] = useState(false);
    const finishHarvest = useCallback((plant) => {
        setHarvesting(null);
        setVisiting(null);
        setNotice(`${plant.plant_name} was harvested. A new season can begin.`);
    }, []);
    useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);
    useEffect(() => { setHarvesting(null); }, [authUser?._id, isLocalMode]);
    const myPlants = plants.filter((plant) => plant.user_id === authUser?._id).map((plant) => ({ ...plant, visualStage: getStage(plant._id) }));
    const selected = myPlants.find((plant) => plant._id === visiting);
    useEffect(() => {
        const list = plantListRef.current;
        if (!list) return undefined;
        const measure = () => setListOverflows(list.scrollHeight > list.clientHeight + 1);
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(list);
        Array.from(list.children).forEach((child) => observer.observe(child));
        return () => observer.disconnect();
    }, [initializing, user, loadingData, myPlants.length]);
    useEffect(() => {
        if (!notice) return;
        const timeout = setTimeout(() => setNotice(''), 5000);
        return () => clearTimeout(timeout);
    }, [notice]);
    useEffect(() => {
        if (!watered) return;
        const timeout = setTimeout(() => setWatered(null), 3500);
        return () => clearTimeout(timeout);
    }, [watered]);
    if (initializing) return <main className="garden-page"><p role="status">Opening the garden gate…</p></main>;
    if (!user) return <GardenEntry />;
    const totalLogs = myPlants.reduce((total, plant) => total + getEntries(plant._id).length, 0);
    const onWater = () => { setWatered(selected._id); setNotice(`Watering recorded for ${selected.plant_name}. A little care goes a long way.`); };
    return (
        <main className="garden-page">
            <div className="garden-shell">
                <header className="garden-header">
                    <div><span className="garden-eyebrow"><span className="garden-status-dot" /> CANNAGOTCHI · GARDEN CLUB</span><h1>Your little green world.</h1><p>Slow days. Small beginnings. A garden that grows with you.</p></div>
                    <div className="garden-mode" aria-label="Application mode"><span aria-current="page"><FiSun />Garden</span><Link to="/plants"><FiGrid />Classic</Link></div>
                </header>
                <div className="garden-layout">
                    <section className="garden-console" aria-label="Your playable garden">
                        <div className="garden-console__top"><span><span className="garden-status-dot" /> {isLocalMode ? 'LOCAL GARDEN' : 'MY GARDEN'}</span><span><FiSun /> A good day to visit</span></div>
                        {!authUser || loadingData ? <div className="garden-world-loading" role="status">{dataError ? 'The plant service is unavailable. Use Try again above.' : 'Finding your plants…'}</div> : <GardenWorld plants={myPlants} onVisitPlant={(plant) => setVisiting(typeof plant === 'string' ? plant : plant._id)} onPlantNew={() => setPlanting(true)} paused={Boolean(selected || planting || harvesting)} selectedPlantId={visiting} wateredPlantId={watered} />}
                        <div className="garden-console__bottom"><FiBookOpen /><p>Your real plants, a tiny world. Tap a plant or walk over to visit.</p><span>{String(myPlants.length).padStart(2, '0')} PLANTS</span></div>
                    </section>
                    <aside className="garden-sidebar">
                        <div className="garden-sidebar__heading"><div><span className="garden-eyebrow">LITTLE COMPANIONS</span><h2>In your garden</h2></div><span className="garden-count">{myPlants.length}</span></div>
                        <p className="garden-sidebar__intro">Every plant has a story. Drop by and add a page.</p>
                        <div className="garden-plant-list" ref={plantListRef}>
                            {myPlants.map((plant) => {
                                const entries = getEntries(plant._id);
                                const age = getPlantAgeInDays(plant.germination_date);
                                return <button className="garden-plant-card" key={plant._id} onClick={() => setVisiting(plant._id)} aria-label={`Visit ${plant.plant_name}`}>
                                    <div className="garden-plant-card__sprite"><PlantSprite plant={plant} stage={plant.visualStage === 'auto' ? undefined : plant.visualStage} size={64} /></div>
                                    <div><strong>{plant.plant_name}</strong><span>{stageLabel(plant)} · {age} days</span><small>{entries.length ? `${entries.length} care ${entries.length === 1 ? 'entry' : 'entries'} saved` : 'A fresh page in your notebook'}</small></div><FiArrowRight />
                                </button>;
                            })}
                            {!myPlants.length && !loadingData && !dataError && <p className="garden-empty">Your first companion starts in an empty pot. Plant something to bring this garden to life.</p>}
                        </div>
                        {listOverflows && <p className="garden-plant-list-hint"><FiArrowDown aria-hidden="true" />Scroll to see all {myPlants.length} plants</p>}
                        <button type="button" className="garden-add" disabled={!authUser || loadingData} onClick={() => setPlanting(true)}><FiPlus /><span>Plant something new<small>There’s always room to grow.</small></span></button>
                        <div className="garden-note"><span className="garden-eyebrow">THE FIELD NOTEBOOK</span><FiBookOpen /><h3>{totalLogs ? `${totalLogs} little moments, remembered.` : 'Good things take their time.'}</h3><p>{totalLogs ? 'Your observations become the story of this garden. Keep what matters to you.' : 'Record a watering, a measurement, or just something you noticed. No timers. Your own pace.'}</p><Link to="/plants">Open the plant collection <FiArrowRight /></Link></div>
                        <p className="garden-storage-note">{isLocalMode ? 'Local plants, care notes and observed stages' : 'Care notes and observed stages'} are saved in this browser.</p>
                    </aside>
                </div>
                <footer className="garden-footer"><span>MADE FOR REAL PLANTS & SMALL JOYS</span><Link to="/home">Open dashboard <FiArrowRight /></Link></footer>
            </div>
            {notice && <div className="garden-toast" role="status"><FiCheck />{notice}</div>}
            {selected && <GardenDialog title={selected.plant_name} onClose={() => setVisiting(null)}>
                <div className="garden-visit"><div className="garden-visit__portrait"><PlantSprite plant={selected} stage={selected.visualStage === 'auto' ? undefined : selected.visualStage} size={112} /></div><div><span className="garden-tag">{stageLabel(selected)}</span><p>{selected.genetic} · {selected.grow_mode === 'Interior' ? 'Indoor' : 'Outdoor'}<br />{isAutoflower(selected.auto) ? 'Autoflower' : 'Photoperiod'}</p></div></div>
                <div className="garden-visit__facts"><div><span>Since germination</span><strong>{getPlantAgeInDays(selected.germination_date)} days</strong></div><div><span>Started</span><strong>{formatPlantDate(selected.germination_date)}</strong></div></div>
                {selected.visualStage === 'auto' && <p className="garden-storage-note">Visual stage is estimated from age. Record the observed stage below to match your real plant.</p>}
                <PlantJournal key={selected._id} plant={selected} onWater={onWater} />
                <div className="garden-dialog__actions"><Link className="garden-button" to={`/plants/${selected._id}`}>Full plant record<FiArrowRight /></Link><Link className="garden-button garden-button--quiet" to={`/edit-plant/${selected._id}`}>Edit details</Link></div>
                <div className="garden-visit__harvest"><p>Finished this plant’s season?</p><button type="button" className="garden-button garden-button--harvest" onClick={() => { setHarvesting({ ...selected }); setVisiting(null); }}><FiScissors />Harvest plant</button></div>
            </GardenDialog>}
            {harvesting && <HarvestPlant plant={harvesting} onCancel={() => { setVisiting(harvesting._id); setHarvesting(null); }} onHarvested={finishHarvest} />}
            {planting && <NewPlant onClose={() => setPlanting(false)} onCreated={(plant) => { setPlanting(false); setVisiting(plant._id); setNotice(`${plant.plant_name} has found a home in your garden.`); }} />}
        </main>
    );
}
