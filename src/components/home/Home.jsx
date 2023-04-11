import { useEffect } from "react";
import { useState } from "react";
import { useAuth } from "../../context/authContext";
import { Link } from "react-router-dom";
import './home.css';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { BsFillPencilFill } from 'react-icons/bs';
import { Footer } from '../footer/Footer';

export const Home = ()=>{

    const [ showing, isShowing ] = useState(false);
    const [ myPlants, setMyPlants ] = useState([]);

    const { user, authUser, plants } = useAuth();

    useEffect(()=>{
        plants && setMyPlants(plants.filter(plant => plant.user_id === authUser?._id))
    }, [plants])
    console.log(user,authUser);

    return (
        <>
        <div className="all_home">
            {user && authUser &&
            <>
            <div className="header">
                <h2>Welcome {authUser.firstName} {authUser.lastName}</h2>
            </div>
            <div className="body">
                <div className="user__card">
                    <div className="card__header">
                        <h3 className="title">My personal profile</h3>
                        <Link to={`/edit-user/${authUser._id}`}>
                            <BsFillPencilFill/>
                        </Link>
                    </div>
                    <div className="fields">
                        <span>Name</span>
                        <span className="data">{authUser.firstName}</span>
                        <span>Last name</span>
                        <span className="data">{authUser.lastName}</span>
                        <span>Email</span>
                        <span className="data">{authUser.email}</span>
                        <span>Password</span>
                        <div className="password">
                            <span className="data">{showing ? authUser.password : '********'}</span>
                            {!showing ? <AiOutlineEye onClick={()=>{isShowing(true)}} /> : <AiOutlineEyeInvisible onClick={()=>{isShowing(false)}} />}
                        </div>
                        <span>Plants</span>
                        {myPlants.length > 0 ? <p>{myPlants.length}</p> :
                            <p className="data">{"No plants yet, "}
                                <Link to={'/add-plant'}>
                                    <span className="link"> add a new one!</span>
                                </Link>
                            </p>
                        }
                    </div>
                </div>
            </div>
            </>}
        </div>
        <Footer />
        </>
    )
}