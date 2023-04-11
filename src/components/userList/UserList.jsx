import { useEffect, useState } from "react";
import './userlist.css';
import { BsFillPencilFill } from 'react-icons/bs';
import { GoTrashcan } from 'react-icons/go'
import { Link } from "react-router-dom";
import Modal from "../modal/modal";
import { useAuth } from "../../context/authContext";

export const UserList = ()=> {

    const [ users, setUsers ] = useState([]);
    const [ show, setShow ] = useState(false);
    const [ isOpen, setIsOpen ] = useState(false);
    const [ confirm, setConfirm ] = useState(false);
    const [ ID, setID ] = useState('');
    const [ name, setName ] = useState('');
    const [ lastname, setLastName ] = useState('');
    // const [ plants, setPlants ] = useState([]);

    const { user } = useAuth();

    const id = localStorage.getItem('id');

    const back = 'https://cannagotchi-server.vercel.app/'

    const ifPrevData = ()=>{
        if(id.length>0){
            setShow(true)
        }
    }

    const getUsers = async () =>{
        const response = await fetch(`${back}users`,{
            headers: {
                'Access-Control-Allow-Origin': 'https://localhost:3000'
              }
        });
        const data = await response.json();
        setUsers(data.data);
        ifPrevData();
    }

    useEffect(()=>{
        getUsers();
        localStorage.removeItem('id');
        console.log(users.plants)
    },[user])

    const handleChange = (id, firstName, lastName)=>{
        setIsOpen(true);
        setID(id);
        setName(firstName);
        setLastName(lastName);
    }

    const handleClose = ()=>{
        setIsOpen(false);
        setConfirm(false)
    }

    const deleteUser = (id, firstName, lastName)=>{
        fetch(`${back}${id}`, {method: 'DELETE'})
                .then((response)=> {
                    if(!response.ok){
                        throw new Error('Something went wrong')
                    }else{
                        setUsers(users.filter(item=>item._id !== id))
                    }
            }).catch((e)=>console.log(e))
            setConfirm(true);
    }

    return (
        <div id="#home" className="all">
            {isOpen &&
            <Modal setIsOpen={setIsOpen} modalTitle={!confirm ? "Are you sure you want to delete this user?" : "User successfully deleted"}>
                {confirm ? <p>{name} {lastname} was deleted</p> : <p>This action cannot be undone</p> }
                <div className='addModalButtons'>
                    <button onClick={()=>deleteUser(ID, name, lastname)} className={confirm? "disabled" : null}>Delete</button>
                    <Link to={'/users'}>
                        <span onClick={handleClose}>{!confirm? 'Cancel' : 'Go back'}</span>
                    </Link>
                </div>
            </Modal>}
            <div className="headerList">
                <h2>User list</h2>
                <div className="editButtons">
                    <button onClick={()=>setShow(true)} className={!show ? "" : "disabled" }>Edit users</button>
                    <button onClick={()=>setShow(false)} className={show ? "" : "disabled" }>Done</button>
                </div>
            </div>
            <div className="userList">
                {users.map((user)=>{
                    return(
                        <div className="userCard" key={user._id}>
                            <div className="header">
                                <h3>{user.firstName} {user.lastName}</h3>
                                <div className={show ? "headersButtons" : "disabled" }>
                                    <Link to={`/edit-user/${user._id}`}>
                                        <BsFillPencilFill className="icon" />
                                    </Link>
                                    <GoTrashcan className="icon" onClick={()=>{
                                        handleChange(user._id, user.firstName, user.lastName)}}/>
                                </div>
                            </div>
                            <span>{user.email}</span>
                            {/* <div>{plants?.map((plant)=>{
                                return(
                                    <div className="plants_card">
                                        <h2>{plant.plant_name}</h2>
                                        <span>{plant.plant_family}</span>
                                    </div>
                                )
                            })}</div> */}
                        </div>
                    )})
                }
            </div>
        </div>
    )
}