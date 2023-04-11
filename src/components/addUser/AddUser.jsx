import { useState } from 'react'
import Modal from '../modal/modal';
import { Link } from 'react-router-dom';
import './adduser.css'
import { appendErrors, useForm } from 'react-hook-form';
import { schema } from './validations';
import { joiResolver } from '@hookform/resolvers/joi';



export const AddUser = ()=> {

    const [ firstName, setFirstName ] = useState('');
    const [ lastName, setLastName ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ isOpen, setIsOpen ] = useState(false);
    const [ success, isSuccess ] = useState(false);

    const back = 'https://cannagotchi-server.vercel.app/'

    const addUser = (e)=>{
        e.preventDefault();

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
            });
        }

    const handleClose = ()=>{
        setIsOpen(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
    }

    const { register, handleSubmit, formState: { errors } } = useForm({
        mode: 'onBlur',
        resolver: joiResolver(schema)
    });

    return (
        <div className="all">
            {isOpen &&
            <Modal setIsOpen={setIsOpen} modalTitle={success===true? "Success" : "Something went wrong"}>
                <p>{success ? "User successfully added" : null}</p>
                <div className='addModalButtons'>
                    <Link to={'/'}>
                        <button onClick={handleClose}>Go back</button>
                    </Link>
                    <Link to={'/add-user'}>
                        <span onClick={handleClose}>Add another user</span>
                    </Link>
                </div>
            </Modal>}
            <div className="title">
                <h2>Add a new user</h2>
            </div>
            <div className="form">
                <form action="" onSubmit={handleSubmit(addUser)}>
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
                        <button action="submit" type="submit" onClick={addUser}>Add</button>
                        <Link to={'/'}>
                            <button>Go back</button>
                        </Link>
                    </div>
                </form>
            </div>

        </div>
    )
}
