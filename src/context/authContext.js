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
    const [ authUser, setAuthUser ] = useState({});
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

    const getPlants = () => {
        fetch(`${back}plants`)
        .then(response=> response.json())
        .then(data => setPlants(data.data))
    };

    useEffect(()=>{
        getUsers();
        getPlants();
        onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
        })
        const userMatch = async () =>{
            try{
                const finding = usuario => usuario.email === user?.email
                setAuthUser(users.find(finding));
                console.log('authuser: ', authUser)
            }catch(e){
                console.log(e.message)
            }
        }
        userMatch();
        console.log(plants)
    },[user, change, deleted, edit, logged])

    const regNew = async (email, password) => {
        try{
            await createUserWithEmailAndPassword(auth, email, password);
            localStorage.setItem('auth', 'auth')
        }
        catch(err){
            const error = err.message;
            localStorage.setItem('auth', JSON.stringify(error))
        }
    }

    const login = async (email,password) => {
        try{
            await signInWithEmailAndPassword(auth, email, password);
            localStorage.setItem('auth', 'auth')
        }
        catch(err){
            const error = err.message;
            localStorage.setItem('auth', JSON.stringify(error))
        }
    }

    const logout = ()=> {
        signOut(auth);
        setAuthUser({});
        localStorage.clear();
    }

    return(
        <authContext.Provider value={{regNew, login, logout, user, users, authUser, plants, setChange, isDeleted, setEdit, isLogged}}>
            {children}
        </authContext.Provider>
    )
};