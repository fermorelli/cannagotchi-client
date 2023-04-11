import './login.css';
import { appendErrors, useForm } from 'react-hook-form';
import { schema } from './validation';
import { joiResolver } from '@hookform/resolvers/joi';
import { useState } from 'react';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../loader/loader';
import { Footer } from '../footer/Footer';

export const LogIn = ()=>{

    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ fetching, isFetching ] = useState(false);
    const [ errmsg, setErrmsg ] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const logIn = (e)=>{
        e.preventDefault();
        isFetching(true);
        login(email,password)
        .then(()=>{
            const auth = localStorage.getItem('auth');
            const evalAuth = ()=>{
                switch(auth){
                    case '"Firebase: Error (auth/wrong-password)."':
                        setErrmsg('Wrong password');
                        break;
                    case '"Firebase: Error (auth/network-request-failed)."':
                        setErrmsg('Network request failed')
                        break;
                    default:
                        console.log('no coincide');
                }
            }
            isFetching(false)
            if(auth==='auth'){
                navigate('/home')
            }else{
                evalAuth();
            }
        })
    }

    const { register, handleSubmit, formState: { errors } } = useForm({
        mode: 'onBlur',
        resolver: joiResolver(schema)
    });

    return(
        <>
        {fetching && <Loader />}
        <div className="all">
            <h1>Log In</h1>
            {errmsg && <span className="error">{errmsg}</span>}
            <form action="" onSubmit={handleSubmit(logIn)} className='form'>
                <label htmlFor="">Email</label>
                <input type="mail" {...register('email')} name="email" error={appendErrors.email?.message} value={email} onChange={(e)=>{setEmail(e.target.value)}} />
                    {errors.email && <span>{errors.email?.message}</span>}
                <label htmlFor="">Password</label>
                <input type="password" {...register('password')} error={appendErrors.password?.message} value={password} onChange={(e)=>{setPassword(e.target.value)}}/>
                    {errors.password && <span>{errors.password?.message}</span>}
                <button action="submit" type='submit' onClick={logIn}>Log in</button>
            </form>
        </div>
        <Footer />
        </>
    )
}