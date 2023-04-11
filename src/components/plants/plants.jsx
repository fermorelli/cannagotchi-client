import { useEffect, useState } from "react";
import { useAuth } from "../../context/authContext";
import { AiFillPlusCircle } from 'react-icons/ai'
import { Link } from "react-router-dom";
import './plants.css'
import { Footer } from '../footer/Footer';

export const Plants = ()=>{

    const [ myPlants, setMyPlants ] = useState([]);
    const { plants, authUser} = useAuth();

    useEffect(()=>{
        plants && setMyPlants(plants.filter(plant => plant.user_id === authUser?._id))
    }, [])

    return (
        <>
        <div className="header">
            <h1 id="title">My plants</h1>
            <Link to={'/add-plant'} className="add-plant">
                <AiFillPlusCircle/>
                <span>add a new plant</span>
            </Link>
        </div>
        {myPlants.length === 0 ? <h2 className="no-plants">You currently don't have any plant added yet, add a new one!</h2> : 
        <div className="all_plants">
        {myPlants.map((plant)=>{
            const date = new Date(plant.germination_date);
            const dateString = date.toLocaleDateString('en-GB');
            return(
                <Link to={`/plants/${plant._id}`}>
                    <div className="plant_card">
                        <div className="plant_attribute">
                            <h4>Genetic</h4>
                            <span>{plant.plant_name}</span>
                        </div>
                        <div className="plant_attribute">
                            <h4>Family</h4>
                            <span>{plant.genetic}</span>
                        </div>
                        <div className="plant_attribute">
                            <h4>Germinated</h4>
                            <span>{dateString}</span>
                        </div>
                        <div className="plant_attribute">
                            <h4>Grow mode</h4>
                            <span>{plant.grow_mode}</span>
                        </div>
                    </div>
                </Link>
            )
        })}
    </div>}
    <Footer />
    </>
    )
};