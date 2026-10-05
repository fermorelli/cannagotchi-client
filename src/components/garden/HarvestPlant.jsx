import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiScissors } from 'react-icons/fi';
import { useAuth } from '../../context/authContext';
import { PlantSprite } from './sprites';
import { GardenDialog } from './GardenDialog';

export function HarvestPlant({ plant, onCancel, onHarvested, returnLabel = 'Back to garden', headingLabel, closeLabel }) {
    const { deletePlant, isLocalMode } = useAuth();
    const [status, setStatus] = useState('confirm');
    const [error, setError] = useState('');
    const savingRef = useRef(false);
    const activeRef = useRef(true);
    const doneRef = useRef(null);
    useEffect(() => {
        activeRef.current = true;
        return () => { activeRef.current = false; };
    }, []);
    useEffect(() => {
        if (status !== 'success') return undefined;
        doneRef.current?.focus();
        const timeout = setTimeout(() => onHarvested(plant), 2200);
        return () => clearTimeout(timeout);
    }, [status, onHarvested, plant]);
    const harvest = async () => {
        if (savingRef.current) return;
        savingRef.current = true;
        setStatus('saving');
        setError('');
        try {
            await deletePlant(plant._id);
            if (activeRef.current) setStatus('success');
        } catch (err) {
            if (activeRef.current) {
                setError(err.message || 'Could not confirm the harvest. Try again.');
                setStatus('confirm');
            }
        } finally {
            savingRef.current = false;
        }
    };
    const finish = () => onHarvested(plant);
    const success = status === 'success';
    return (
        <GardenDialog title={success ? 'A season, complete.' : `Harvest ${plant.plant_name}?`} onClose={success ? finish : onCancel} closeDisabled={status === 'saving'} className="garden-harvest-dialog" headingLabel={headingLabel} closeLabel={closeLabel}>
            {success ? <>
                <div className="garden-harvest-animation" aria-hidden="true">
                    <div className="garden-harvest-animation__plant"><PlantSprite plant={plant} stage={plant.visualStage} size={96} /></div>
                    <svg className="garden-harvest-animation__basket" viewBox="0 0 48 40" width="144" height="120" shapeRendering="crispEdges">
                        <path fill="#614c34" d="M12 8h4V4h16v4h4v13h-4V9h-3V8H19v1h-3v12h-4z" />
                        <path fill="#547841" d="M14 17h6v-4h5v4h7v-5h5v7h3v8H10v-8h4z" />
                        <path fill="#a7bc64" d="M16 17h3v6h-3zM24 15h3v9h-3zM33 17h3v7h-3z" />
                        <path fill="#654a32" d="M7 23h34v5h-3v9H10v-9H7z" />
                        <path fill="#bb8a51" d="M9 24h30v3H9zM12 28h24v7H12z" />
                        <path fill="#e4bd7a" d="M9 24h30v1H9zM13 28h2v7h-2zM20 28h2v7h-2zM27 28h2v7h-2zM34 28h2v7h-2z" />
                        <path fill="#927047" d="M12 30h24v2H12zM12 34h24v1H12z" />
                    </svg>
                    <span className="garden-harvest-animation__spark garden-harvest-animation__spark--left">✦</span><span className="garden-harvest-animation__spark garden-harvest-animation__spark--right">✦</span>
                </div>
                <p className="garden-dialog__intro" role="status"><strong>{plant.plant_name}</strong> was harvested and removed from your collection. There’s room for a new beginning.</p>
                <div className="garden-dialog__actions"><button ref={doneRef} type="button" className="garden-button" onClick={finish}>{returnLabel}<FiCheck /></button></div>
            </> : <>
                <p className="garden-dialog__intro">Confirm that you have harvested <strong>{plant.plant_name}</strong>. This permanently deletes its plant record from Garden and Classic. It cannot be undone.</p>
                {!isLocalMode && <p className="garden-harvest-warning">This is your account collection: the plant will also be removed from the deployed app.</p>}
                <p className="garden-storage-note">Its care notes are kept in this browser, but will no longer appear in the garden.</p>
                {error && <p className="garden-error" role="alert">{error}</p>}
                {status === 'saving' && <p className="garden-dialog__intro" role="status">Harvesting… Waiting for the plant record to be removed.</p>}
                <div className="garden-dialog__actions"><button type="button" className="garden-button garden-button--harvest" onClick={harvest} disabled={status === 'saving'}><FiScissors />{status === 'saving' ? 'Harvesting…' : 'Harvest and remove'}</button><button type="button" className="garden-button garden-button--quiet" onClick={onCancel} disabled={status === 'saving'} data-autofocus>Keep plant</button></div>
            </>}
        </GardenDialog>
    );
}
