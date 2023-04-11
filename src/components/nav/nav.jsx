import './nav.css'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/authContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../modal/modal'
import { GiChestnutLeaf } from 'react-icons/gi'

export const Nav = ()=>{
    const [ isOpen, setIsOpen ] = useState(false);
    const [ confirm, setConfirm ] = useState(false);

    const { user, logout } = useAuth();

    const navigate = useNavigate();

    const handleLogOut = async () => {
        setIsOpen(false);
        await logout();
        navigate('/')
    }

    const handleClose = ()=>{
        setIsOpen(false);
        setConfirm(false)
    }

    return (
        <nav>
            {isOpen &&
            <Modal setIsOpen={setIsOpen} modalTitle={!confirm && "Are you sure you want to exit?"}>
                    <div className='addModalButtons'>
                        <button onClick={handleLogOut} className={confirm? "disabled" : null}>Yes</button>
                        <span style={{cursor:'pointer'}} onClick={handleClose}>{!confirm && 'Cancel'}</span>
                    </div>
                </Modal>}
            <div className="links">
                <Link to={'/'} className='logo'>
                    <GiChestnutLeaf />
                    <span>Cannagotchi</span>
                </Link>
                {user ?
                    <>
                        <Link to={'/home'}>Home</Link>
                        {/* <Link to={'/users'}>Users</Link>
                        <Link to={'/add-user'}>Add User</Link> */}
                        <Link to={'/plants'}>My Plants</Link>
                        <span onClick={()=>{setIsOpen(true)}} id='logout'>Log out</span>
                    </>
                :
                    <>
                        <Link to={'/login'}>Log in</Link>
                        <Link to={'/signup'}>Sign up</Link>
                    </>}
            </div>
        </nav>
    )
}