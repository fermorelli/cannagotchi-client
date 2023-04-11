import { useState } from 'react'
import Modal from '../modal/modal';
import { useParams, useNavigate  } from 'react-router-dom';
import './editUser.css'
import { useEffect } from 'react';
import { Footer } from '../footer/Footer';

export const EditUser = ()=> {

    const [ firstName, setFirstName ] = useState();
    const [ lastName, setLastName ] = useState();
    const [ email, setEmail ] = useState();
    const [ password, setPassword ] = useState();
    const [ isOpen, setIsOpen ] = useState(false);
    const [ success, isSuccess ] = useState(false);
    const [ data, setData ] = useState([]);

    const back = 'https://cannagotchi-server.vercel.app/'

    const params = useParams();
    const id = params.id;

    localStorage.setItem('id', id);

    const navigate = useNavigate();

    const getUser = async () =>{
        const response = await fetch(`${back}users/${id}`);
        const data = await response.json();
        setData(data.data);
    }

    useEffect(()=>{
        getUser();
    },[])

    const handleClose = ()=>{
        setIsOpen(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        navigate(-1);
    }

    const editUser = (e) =>{
        e.preventDefault();

        fetch(`${back}users/${id}`, {
            method: 'PUT',
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

    return (
        <>
        <div className="all">
            {isOpen &&
            <Modal setIsOpen={setIsOpen} modalTitle={success===true? "Success" : "Something went wrong"}>
                <p>{success ? "User successfully updated" : null}</p>
                <div className='addModalButtons'>
                    <button onClick={handleClose}>Go back</button>
                </div>
            </Modal>}
            <div className="title">
                <h2>Update user</h2>
            </div>
            <div className="form">
                <form action="">
                    <label htmlFor="">First Name</label>
                    <input type="text" placeholder={data.firstName} value={firstName} onChange={(e)=>{setFirstName(e.target.value)}}/>
                    <label htmlFor="">Last Name</label>
                    <input type="text" placeholder={data.lastName} value={lastName} onChange={(e)=>{setLastName(e.target.value)}}/>
                    <label htmlFor="">Email</label>
                    <input type="mail" placeholder={data.email} value={email} onChange={(e)=>{setEmail(e.target.value)}} />
                    <label htmlFor="">Password</label>
                    <input type="password" placeholder={data.password} value={password} onChange={(e)=>{setPassword(e.target.value)}}/>
                    <div className='formButtons'>
                        <button type="submit" onClick={editUser}>Update</button>
                        <button onClick={()=>navigate('/')}>Go back</button>
                    </div>
                </form>
            </div>
        </div>
        <Footer/>
        </>
    )
}
