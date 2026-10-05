import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './authContext';
import { CARE_STAGES, createCareEntry, emptyCareJournal, getCareStorageKey, sanitizeCareJournal } from '../utils/care';

const CareContext = createContext(null);
const EMPTY_ENTRIES = [];

export const useCare = () => {
    const context = useContext(CareContext);
    if (!context) throw new Error('useCare must be used within CareProvider.');
    return context;
};

const loadJournal = (scope) => {
    if (!scope) return { journal: emptyCareJournal(), storageAvailable: true };
    try {
        const raw = window.localStorage.getItem(getCareStorageKey(scope));
        return { journal: raw ? sanitizeCareJournal(JSON.parse(raw)) : emptyCareJournal(), storageAvailable: true };
    } catch {
        return { journal: emptyCareJournal(), storageAvailable: false };
    }
};

const ScopedCareProvider = ({ scope, children }) => {
    const [session, setSession] = useState(() => ({ scope, ...loadJournal(scope) }));
    const journalRef = useRef(session.journal);
    const activeScopeRef = useRef(scope);
    activeScopeRef.current = scope;
    // Reset scoped data before children render, preserving the routes and their UI state.
    if (session.scope !== scope) {
        const next = { scope, ...loadJournal(scope) };
        journalRef.current = next.journal;
        setSession(next);
    }
    const { journal, storageAvailable } = session;

    const saveJournal = useCallback((next) => {
        if (activeScopeRef.current !== scope) return false;
        journalRef.current = next;
        let available = true;
        try {
            window.localStorage.setItem(getCareStorageKey(scope), JSON.stringify(next));
        } catch {
            available = false;
        }
        setSession({ scope, journal: next, storageAvailable: available });
        return available;
    }, [scope]);

    useEffect(() => {
        if (!scope) return undefined;
        const syncJournal = (event) => {
            if (activeScopeRef.current !== scope) return;
            if (event.storageArea !== window.localStorage || (event.key !== null && event.key !== getCareStorageKey(scope))) return;
            const next = loadJournal(scope);
            journalRef.current = next.journal;
            setSession({ scope, ...next });
        };
        window.addEventListener('storage', syncJournal);
        return () => window.removeEventListener('storage', syncJournal);
    }, [scope]);

    const checkPlant = (plantId) => {
        if (activeScopeRef.current !== scope) throw new Error('Your garden account changed. Open the plant again.');
        if (!scope) throw new Error('Open your garden before adding a care record.');
        if (!plantId || typeof plantId !== 'string') throw new Error('This plant needs a saved record first.');
    };

    const addEntry = (plantId, values) => {
        checkPlant(plantId);
        const entry = createCareEntry(values);
        const current = journalRef.current;
        saveJournal({
            ...current,
            entries: { ...current.entries, [plantId]: [entry, ...(current.entries[plantId] || [])]
                .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt)) },
        });
        return entry;
    };

    const removeEntry = (plantId, entryId) => {
        checkPlant(plantId);
        const current = journalRef.current;
        saveJournal({ ...current, entries: { ...current.entries, [plantId]: (current.entries[plantId] || []).filter(({ id }) => id !== entryId) } });
    };

    const setStage = (plantId, stage) => {
        checkPlant(plantId);
        if (!CARE_STAGES.some(({ value }) => value === stage)) throw new Error('Choose a valid growth stage.');
        const current = journalRef.current;
        const stages = { ...current.stages };
        if (stage === 'auto') delete stages[plantId];
        else stages[plantId] = stage;
        saveJournal({ ...current, stages });
    };

    return (
        <CareContext.Provider value={{
            getEntries: (plantId) => journal.entries[plantId] || EMPTY_ENTRIES,
            getStage: (plantId) => journal.stages[plantId] || 'auto',
            addEntry, removeEntry, setStage, storageAvailable, canSave: !!scope,
        }}>
            {children}
        </CareContext.Provider>
    );
};

export const CareProvider = ({ children }) => {
    const { user, authUser } = useAuth();
    const scope = user?.uid || (user && authUser?._id) || null;
    return <ScopedCareProvider scope={scope}>{children}</ScopedCareProvider>;
};
