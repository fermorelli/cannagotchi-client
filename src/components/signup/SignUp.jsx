import { useState } from 'react'
import Modal from '../modal/modal';
import { Link } from 'react-router-dom';
import '../addUser/adduser.css';
import { appendErrors, useForm } from 'react-hook-form';
import { schema } from '../addUser/validations';
import { joiResolver } from '@hookform/resolvers/joi';
import { useAuth } from '../../context/authContext';
import { Loader } from '../loader/loader';
import { Footer } from '../footer/Footer';


export const SignUp = ()=> {

    const [ firstName, setFirstName ] = useState('');
    const [ lastName, setLastName ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ isOpen, setIsOpen ] = useState(false);
    const [ success, isSuccess ] = useState(false);
    const [ fetching, isFetching ] =useState(false);
    const [ errmsg, setErrmsg ] = useState('');

    const { regNew, isLogged } = useAuth();

    const back = 'https://cannagotchi-server.vercel.app/'

    const addUser = ()=>{

        const auth = localStorage.getItem('auth');

        auth === 'auth' ?
        fetch(`${back}users`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Access-Control-Allow-Origin': 'https://localhost:3000'
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            })})
            .then((response) => response.json())
            .then((data) => {
                if(data.error===false){
                    isSuccess(true)
                    setIsOpen(true)
                }
            })
            .catch((err) => {
                console.log(err.message);
                isSuccess(false);
            })
            :
            console.log(auth)
            switch(auth){
                case '"Firebase: Error (auth/email-already-in-use)."':
                    setErrmsg('Mail already in use, please choose another one');
                    break;
                case '"Firebase: Error (auth/network-request-failed)."':
                    setErrmsg('Network request failed')
                    break;
                default:
                    console.log('no coincide');
            }
    }

    const signUp = (e)=>{
        e.preventDefault();
        isFetching(true);
        regNew(email,password)
            .then(()=>{
                addUser();
                isLogged(true)
                isFetching(false);
            })
        }

    const handleClose = ()=>{
        setIsOpen(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        isLogged(false)
    }

    const { register, handleSubmit, formState: { errors } } = useForm({
        mode: 'onBlur',
        resolver: joiResolver(schema)
    });

    return (
        <>
        {fetching && <Loader />}
        <div className="all">
            {isOpen &&
            <Modal setIsOpen={setIsOpen} modalTitle={success===true? "Success" : "Something went wrong"}>
                <p>{success ? "New account created" : null}</p>
                <div className='addModalButtons'>
                    <Link to={'/home'}>
                        <button onClick={handleClose}>Go back</button>
                    </Link>
                </div>
            </Modal>}
            <div className="title">
                <h2>Sign up</h2>
            </div>
            <div className="form">
                {errmsg && <span className="error">{errmsg}</span>}
                <form action="" onSubmit={handleSubmit(signUp)}>
                    <label htmlFor="">First Name</label>
                    <input type="text" {...register('firstName')} name="firstName" error={appendErrors.firstName?.message} value={firstName} onChange={(e)=>{setFirstName(e.target.value)}}/>
                        {errors.firstName && <span>{errors.firstName?.message}</span>}
                    <label htmlFor="">Last Name</label>
                    <input type="text" {...register('lastName')} name="lastName" error={appendErrors.lastName?.message} value={lastName} onChange={(e)=>{setLastName(e.target.value)}}/>
                        {errors.lastName && <span>{errors.lastName?.message}</span>}
                    <label htmlFor="">Email</label>
                    <input type="mail" {...register('email')} name="email" error={appendErrors.email?.message} value={email} onChange={(e)=>{setEmail(e.target.value)}} />
                        {errors.email && <span>{errors.email?.message}</span>}
                    <label htmlFor="">Password</label>
                    <input type="password" {...register('password')} error={appendErrors.password?.message} value={password} onChange={(e)=>{setPassword(e.target.value)}}/>
                        {errors.password && <span>{errors.password?.message}</span>}
                    <div className='formButtons'>
                        <button action="submit" type="submit" onClick={signUp}>Sign up</button>
                        <Link to={'/'}>
                            <button>Go back</button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
        <Footer />
        </>
    )
}