import { useId, useState } from 'react';
import { FiBookOpen, FiDroplet, FiEdit3, FiFeather, FiMaximize2, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCare } from '../../context/careContext';
import { CARE_STAGES, CARE_TYPES, formatCareDate, localDateTimeValue } from '../../utils/care';
import './plantJournal.css';

const entryIcons = { water: FiDroplet, feed: FiFeather, note: FiEdit3, measurement: FiMaximize2 };

export const PlantJournal = ({ plant, onWater }) => {
    const { getEntries, addEntry, removeEntry, getStage, setStage, storageAvailable, canSave } = useCare();
    const formId = useId();
    const [type, setType] = useState('water');
    const [note, setNote] = useState('');
    const [height, setHeight] = useState('');
    const [date, setDate] = useState(() => localDateTimeValue());
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [pendingRemove, setPendingRemove] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const plantId = plant?._id;
    const entries = getEntries(plantId);
    const visibleEntries = showAll ? entries : entries.slice(0, 4);
    const canLog = canSave && !!plantId;

    const submitEntry = (event) => {
        event.preventDefault();
        setError('');
        try {
            addEntry(plantId, { type, note, height, date });
            setStatus(`${CARE_TYPES.find(({ value }) => value === type).label} entry added.`);
            setNote('');
            setHeight('');
            setDate(localDateTimeValue());
            if (type === 'water') onWater?.();
        } catch (problem) {
            setError(problem.message);
            setStatus('');
        }
    };

    const changeStage = (event) => {
        try {
            setStage(plantId, event.target.value);
            setStatus('Visual growth stage updated.');
            setError('');
        } catch (problem) {
            setError(problem.message);
        }
    };

    return (
        <section className="plant-journal" aria-labelledby={`${formId}-title`}>
            <div className="plant-journal__heading">
                <span className="plant-journal__emblem" aria-hidden="true"><FiBookOpen /></span>
                <div>
                    <span className="plant-journal__eyebrow">A little care, recorded</span>
                    <h2 id={`${formId}-title`}>Plant journal</h2>
                </div>
                <span className="plant-journal__count">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
            </div>
            <p className="plant-journal__local-note">Journal entries and observed stages are saved only in this browser, for this account. They are not synced to the server.</p>
            {!storageAvailable && <p className="plant-journal__warning" role="alert">Browser storage is unavailable. Changes are kept for this session only and will be lost when you leave.</p>}

            <div className="plant-journal__stage">
                <div>
                    <label htmlFor={`${formId}-stage`}>Observed growth stage</label>
                    <p>Choose what you see to update your garden sprite. The age estimate is approximate.</p>
                </div>
                <select id={`${formId}-stage`} value={getStage(plantId)} onChange={changeStage} disabled={!canLog}>
                    {CARE_STAGES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
            </div>

            <form className="plant-journal__form" onSubmit={submitEntry}>
                <div className="plant-journal__fields">
                    <div className="plant-journal__field">
                        <label htmlFor={`${formId}-type`}>What happened?</label>
                        <select id={`${formId}-type`} value={type} onChange={(event) => { setType(event.target.value); setError(''); }} disabled={!canLog}>
                            {CARE_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                        </select>
                    </div>
                    <div className="plant-journal__field">
                        <label htmlFor={`${formId}-date`}>When</label>
                        <input id={`${formId}-date`} type="datetime-local" value={date} required onChange={(event) => setDate(event.target.value)} disabled={!canLog} />
                    </div>
                </div>
                {type === 'measurement' && (
                    <div className="plant-journal__field">
                        <label htmlFor={`${formId}-height`}>Height (cm)</label>
                        <input id={`${formId}-height`} type="number" min="0.1" max="10000" step="0.1" placeholder="e.g. 24.5" required value={height} onChange={(event) => setHeight(event.target.value)} disabled={!canLog} />
                    </div>
                )}
                <div className="plant-journal__field">
                    <label htmlFor={`${formId}-note`}>{type === 'note' ? 'Observation' : 'Notes (optional)'}</label>
                    <textarea id={`${formId}-note`} rows="2" maxLength="1000" placeholder={type === 'note' ? 'What did you notice today?' : 'Record amounts, conditions, or anything useful…'} value={note} required={type === 'note'} onChange={(event) => setNote(event.target.value)} disabled={!canLog} />
                </div>
                {error && <p className="plant-journal__warning" role="alert">{error}</p>}
                <div className="plant-journal__submit-row">
                    <p className="plant-journal__status" role="status">{status || 'Log the real care you gave this plant.'}</p>
                    <button className="plant-journal__button" type="submit" disabled={!canLog}><FiPlus aria-hidden="true" /> Add entry</button>
                </div>
            </form>

            <div className="plant-journal__history">
                <h3>Recent records</h3>
                {entries.length === 0 ? (
                    <p className="plant-journal__empty">Your plant’s story starts here. Add an observation, a measurement, or care you have completed.</p>
                ) : (
                    <ol className="plant-journal__entries">
                        {visibleEntries.map((entry) => {
                            const Icon = entryIcons[entry.type];
                            const label = CARE_TYPES.find(({ value }) => value === entry.type).label;
                            return (
                                <li key={entry.id} className={`plant-journal__entry plant-journal__entry--${entry.type}`}>
                                    <span className="plant-journal__entry-icon" aria-hidden="true"><Icon /></span>
                                    <div className="plant-journal__entry-content">
                                        <strong>{label}{entry.type === 'measurement' ? ` · ${entry.height} cm` : ''}</strong>
                                        <time dateTime={entry.occurredAt}>{formatCareDate(entry.occurredAt)}</time>
                                        {entry.note && <p>{entry.note}</p>}
                                        {pendingRemove === entry.id && (
                                            <div className="plant-journal__remove-confirm">
                                                <span>Remove this record?</span>
                                                <button type="button" onClick={() => { removeEntry(plantId, entry.id); setPendingRemove(null); setStatus('Journal entry removed.'); }}>Remove</button>
                                                <button type="button" onClick={() => setPendingRemove(null)}>Keep</button>
                                            </div>
                                        )}
                                    </div>
                                    <button className="plant-journal__remove" type="button" aria-label={`Remove ${label.toLowerCase()} from ${formatCareDate(entry.occurredAt)}`} onClick={() => setPendingRemove(entry.id)}><FiTrash2 aria-hidden="true" /></button>
                                </li>
                            );
                        })}
                    </ol>
                )}
                {entries.length > 4 && <button className="plant-journal__more" type="button" onClick={() => setShowAll(!showAll)}>{showAll ? 'Show recent records' : `Show all ${entries.length} records`}</button>}
            </div>
        </section>
    );
};
