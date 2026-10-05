import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import {
    isLocalGardenActive, LOCAL_GARDEN_KEY, localGardenProfile, localGardenUser, newLocalPlantId,
    readLocalPlants, saveLocalPlants, setLocalGardenActive,
} from '../utils/localGarden';

const authContext = createContext();
export const useAuth = () => useContext(authContext);

const initialSession = () => {
    const local = isLocalGardenActive();
    if (!local) return { local, plants: [], error: '' };
    try { return { local, plants: readLocalPlants(), error: '' }; }
    catch (error) { return { local, plants: [], error: error.message }; }
};

const requestApi = async (path, options = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`/api/${path}`, { ...options, signal: controller.signal });
        let data;
        try { data = await response.json(); }
        catch {
            if (response.ok && (response.status === 204 || options.method === 'DELETE')) return {};
            throw new Error('The plant service is unavailable or returned an unexpected response.');
        }
        if (!data || typeof data !== 'object') throw new Error('The plant service returned an unexpected response.');
        if (!response.ok || data.error === true) {
            throw new Error(typeof data.message === 'string' ? data.message : `The plant service could not complete this request (${response.status}).`);
        }
        return data;
    } catch (error) {
        if (error.name === 'AbortError') throw new Error('The plant service took too long to respond. Please try again.');
        if (error instanceof TypeError) throw new Error('Could not reach the plant service. Check your connection and API server.');
        throw error;
    } finally {
        clearTimeout(timer);
    }
};

const plantRecord = (values, owner) => {
    const record = {
        user_id: owner,
        plant_name: String(values.plant_name || '').trim(),
        genetic: String(values.genetic || ''),
        grow_mode: String(values.grow_mode || ''),
        auto: values.auto === true || values.auto === 'true' || values.auto === 'on' || values.auto === 1,
        germination_date: values.germination_date instanceof Date ? values.germination_date.toISOString().slice(0, 10) : String(values.germination_date || '').slice(0, 10),
    };
    if (!record.plant_name || !record.genetic || !record.grow_mode || !record.germination_date || Number.isNaN(new Date(record.germination_date).getTime())) {
        throw new Error('Enter a plant name, genetics, grow mode, and valid germination date.');
    }
    return record;
};

export const AuthProvider = ({ children }) => {
    const [initial] = useState(initialSession);
    const [isLocalMode, setIsLocalMode] = useState(initial.local);
    const [user, setUser] = useState(initial.local ? localGardenUser : null);
    const [users, setUsers] = useState(initial.local ? [localGardenProfile] : []);
    const [plants, setPlants] = useState(initial.plants);
    const [authUser, setAuthUser] = useState(initial.local ? localGardenProfile : null);
    const [initializing, setInitializing] = useState(!initial.local);
    const [loadingData, setLoadingData] = useState(false);
    const [dataError, setDataError] = useState(initial.error);
    const [refreshVersion, setRefreshVersion] = useState(0);
    const modeRef = useRef(initial.local);
    const userRef = useRef(user);
    const profileRef = useRef(authUser);
    const plantsRef = useRef(plants);
    const firebaseUserRef = useRef(null);
    const sessionRef = useRef(0);
    const requestRef = useRef(0);

    const publishPlants = useCallback((next) => {
        plantsRef.current = next;
        setPlants(next);
    }, []);

    const retryData = useCallback(async () => {
        const request = ++requestRef.current;
        const session = sessionRef.current;
        const currentUser = userRef.current;
        const currentLocal = modeRef.current;
        if (!currentUser) return;
        const isCurrent = () => requestRef.current === request && sessionRef.current === session;
        setLoadingData(true);
        setDataError('');
        try {
            if (currentLocal) {
                const next = readLocalPlants();
                if (isCurrent()) publishPlants(next);
                return next;
            }
            const [userData, plantData] = await Promise.all([requestApi('users'), requestApi('plants')]);
            if (!Array.isArray(userData.data) || !Array.isArray(plantData.data)) throw new Error('The plant service returned incomplete collection data.');
            const profile = userData.data.find((item) => item.email?.toLowerCase() === currentUser.email?.toLowerCase());
            if (!profile?._id) throw new Error('Your account profile could not be loaded. Retry after the account service is available.');
            const owned = plantData.data.filter((plant) => plant.user_id === profile._id);
            if (isCurrent()) {
                profileRef.current = profile;
                setAuthUser(profile);
                setUsers(userData.data);
                publishPlants(owned);
            }
            return owned;
        } catch (error) {
            if (isCurrent()) setDataError(error.message);
            return null;
        } finally {
            if (isCurrent()) setLoadingData(false);
        }
    }, [publishPlants]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            firebaseUserRef.current = currentUser;
            if (!modeRef.current) {
                sessionRef.current += 1;
                requestRef.current += 1;
                userRef.current = currentUser;
                profileRef.current = null;
                setUser(currentUser);
                setAuthUser(null);
                setUsers([]);
                publishPlants([]);
                setDataError('');
                setLoadingData(false);
                setRefreshVersion((version) => version + 1);
            }
            setInitializing(false);
        });
        return () => { unsubscribe(); requestRef.current += 1; };
    }, [publishPlants]);

    useEffect(() => { retryData(); }, [user, isLocalMode, refreshVersion, retryData]);

    useEffect(() => {
        const onStorage = (event) => {
            if (modeRef.current && event.key === LOCAL_GARDEN_KEY) retryData();
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [retryData]);

    const startLocalGarden = useCallback(() => {
        const next = readLocalPlants();
        setLocalGardenActive(true);
        sessionRef.current += 1;
        requestRef.current += 1;
        modeRef.current = true;
        userRef.current = localGardenUser;
        profileRef.current = localGardenProfile;
        setIsLocalMode(true);
        setUser(localGardenUser);
        setAuthUser(localGardenProfile);
        setUsers([localGardenProfile]);
        publishPlants(next);
        setDataError('');
        setLoadingData(false);
        setInitializing(false);
    }, [publishPlants]);

    const leaveLocalGarden = useCallback(() => {
        setLocalGardenActive(false);
        sessionRef.current += 1;
        requestRef.current += 1;
        modeRef.current = false;
        const currentUser = auth.currentUser || firebaseUserRef.current;
        userRef.current = currentUser;
        profileRef.current = null;
        setIsLocalMode(false);
        setUser(currentUser);
        setAuthUser(null);
        setUsers([]);
        publishPlants([]);
        setDataError('');
        setLoadingData(false);
    }, [publishPlants]);

    const mutatePlant = useCallback(async (method, id, values) => {
        const profile = profileRef.current;
        if (!profile?._id || !userRef.current) throw new Error('Your profile must finish loading before changing plants.');
        const existing = id ? plantsRef.current.find((plant) => plant._id === id && plant.user_id === profile._id) : null;
        if (id && !existing) throw new Error('This plant is not in your collection.');
        const record = method === 'DELETE' ? null : plantRecord(values, profile._id);
        const session = sessionRef.current;
        const previousIds = new Set(plantsRef.current.map((plant) => plant._id));
        if (modeRef.current) {
            // Read first so another tab's edits are retained; save before publishing success.
            const current = readLocalPlants();
            if (id && !current.some((plant) => plant._id === id)) throw new Error('This plant has already been removed.');
            const updated = method === 'POST' ? { ...record, _id: newLocalPlantId() } : { ...existing, ...record };
            const next = method === 'POST' ? [...current, updated] : method === 'DELETE' ? current.filter((plant) => plant._id !== id) : current.map((plant) => plant._id === id ? updated : plant);
            saveLocalPlants(next);
            publishPlants(next);
            return method === 'DELETE' ? undefined : updated;
        }
        const result = await requestApi(id ? `plants/${encodeURIComponent(id)}` : 'plants', {
            method,
            ...(record ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(record) } : {}),
        });
        if (sessionRef.current !== session) throw new Error('Your workspace changed. Review the current collection before continuing.');
        if (method === 'DELETE') {
            // A refresh begun before this deletion can still contain the old record.
            // Invalidate it before publishing the confirmed removal, including its error state.
            requestRef.current += 1;
            setLoadingData(false);
            setDataError('');
            publishPlants(plantsRef.current.filter((plant) => plant._id !== id));
            return undefined;
        }
        const returned = result.data && !Array.isArray(result.data) && result.data._id ? result.data : null;
        const updated = { ...(existing || {}), ...record, ...(returned || {}), ...(id ? { _id: id } : {}), user_id: profile._id };
        if (updated._id) {
            publishPlants(method === 'POST' ? [...plantsRef.current.filter((plant) => plant._id !== updated._id), updated] : plantsRef.current.map((plant) => plant._id === id ? updated : plant));
        }
        // Keep the existing API as the source of truth even when it returns only a success flag.
        const refreshed = await retryData();
        if (sessionRef.current !== session) throw new Error('Your workspace changed. Review the current collection before continuing.');
        if (method === 'POST' && !updated._id) {
            const created = refreshed?.find((plant) => !previousIds.has(plant._id) && ['plant_name', 'genetic', 'grow_mode'].every((key) => plant[key] === record[key]) && String(plant.germination_date).slice(0, 10) === record.germination_date);
            if (created) return created;
            const error = new Error('The plant was saved, but its record could not be reloaded. Refresh the collection before adding it again.');
            error.saved = true;
            throw error;
        }
        return refreshed?.find((plant) => plant._id === updated._id) || updated;
    }, [publishPlants, retryData]);

    const createPlant = useCallback((values) => mutatePlant('POST', null, values), [mutatePlant]);
    const updatePlant = useCallback((id, values) => mutatePlant('PUT', id, values), [mutatePlant]);
    const deletePlant = useCallback((id) => mutatePlant('DELETE', id), [mutatePlant]);
    const refreshLegacy = useCallback((value) => { if (value) setRefreshVersion((version) => version + 1); }, []);
    const regNew = (email, password) => {
        if (modeRef.current) leaveLocalGarden();
        return createUserWithEmailAndPassword(auth, email, password);
    };
    const login = (email, password) => {
        if (modeRef.current) leaveLocalGarden();
        return signInWithEmailAndPassword(auth, email, password);
    };
    const logout = async () => {
        if (modeRef.current) { leaveLocalGarden(); return; }
        await signOut(auth);
    };

    return (
        <authContext.Provider value={{
            regNew, login, logout, user, users, authUser, plants, initializing,
            isLocalMode, startLocalGarden, leaveLocalGarden,
            createPlant, updatePlant, deletePlant, dataError, loadingData, retryData,
            setChange: refreshLegacy, isDeleted: refreshLegacy, setEdit: refreshLegacy, isLogged: refreshLegacy,
        }}>
            {children}
        </authContext.Provider>
    );
};
