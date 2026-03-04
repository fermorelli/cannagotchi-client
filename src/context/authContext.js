import { createContext, useContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

const authContext = createContext();

export const useAuth = () =>{
    const context = useContext(authContext);
    return context;
}

export const AuthProvider = ({children})=>{

    const [ user, setUser ] = useState(null);
    const [ users, setUsers ] = useState([]);
    const [ plants, setPlants ] = useState([]);
    const [ authUser, setAuthUser ] = useState(null);
    const [ initializing, setInitializing ] = useState(true);
    const [ change, setChange ] = useState(false);
    const [ edit, setEdit ] = useState(false);
    const [ deleted, isDeleted ] = useState(false);
    const [ logged, isLogged ] = useState(false);

    const back = 'https://cannagotchi-server.vercel.app/'

    const getUsers = async () => {
        const response = await fetch(`${back}users`);
        const data = await response.json();
        setUsers(data.data)
    };

    const getPlants = async () => {
        const response = await fetch(`${back}plants`);
        const data = await response.json();
        setPlants(data.data);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            setInitializing(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) {
            setAuthUser(null);
            return;
        }

        const fetchData = async () => {
            try {
                await Promise.all([getUsers(), getPlants()]);
            } catch (e) {
                console.log(e.message);
            }
        };

        fetchData();
    }, [user, change, deleted, edit, logged]);

    useEffect(() => {
        if (!user || users.length === 0) return;
        const match = users.find(u => u.email === user.email) || null;
        setAuthUser(match);
    }, [user, users]);

    const regNew = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const login = (email,password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = ()=> {
        signOut(auth);
        setAuthUser(null);
    }

    return(
        <authContext.Provider value={{regNew, login, logout, user, users, authUser, plants, setChange, isDeleted, setEdit, isLogged, initializing}}>
            {children}
        </authContext.Provider>
    )
};