import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { BsFillPencilFill } from 'react-icons/bs';
import { GoTrashcan } from 'react-icons/go'
import Modal from "../modal/modal";
import { Footer } from "../footer/Footer";
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/material.css';
import 'tippy.js/animations/scale.css';
import './singleplant.css';
import sprite1 from '../../assets/sprite1.jpg'
import sprite2 from '../../assets/sprite2.jpg'
import sprite3 from '../../assets/sprite3.jpg'
import sprite4 from '../../assets/sprite4.jpg'
import sprite5 from '../../assets/sprite5.jpg'
import sprite6 from '../../assets/sprite6.jpg'

export const SinglePlant = () => {
    const [ plant, setPlant ] = useState({});
    const [ isOpen, setIsOpen ] = useState(false);
    const [ confirm, setConfirm ] = useState(false);
    const [ plantName, setPlantName ] = useState('');
    const [ ID, setID ] = useState('');

    const { isDeleted } = useAuth();

    const params = useParams();
    const id = params.id;

    const back = 'https://cannagotchi-server.vercel.app/'

    const navigate = useNavigate();

    const getPlant = () => {
        fetch(`${back}plants/${id}`,{
            headers: {
                'Access-Control-Allow-Origin': 'https://localhost:3000'
              }
        })
        .then(response=>response.json())
        .then(data=>setPlant(data.data))
    }

    useEffect(()=>{
        getPlant()
    },[])

    const deletePlant = (id)=>{
        fetch(`${back}plants/${id}`, {method: 'DELETE'})
                .then((response)=> {
                    if(!response.ok){
                        throw new Error('Something went wrong')
                    }else{
                        isDeleted(true);
                    }
            }).catch((e)=>console.log(e))
            setConfirm(true);
            localStorage.setItem('change', 1)
    }

    const handleClose = ()=>{
        setIsOpen(false);
        setConfirm(false)
        isDeleted(false);
    }

    const handleChange = (id, plant_name)=>{
        setIsOpen(true);
        setID(id);
        setPlantName(plant_name);
    }

    const gerDate = new Date(plant.germination_date);
    const dateString = gerDate.toLocaleDateString('en-GB');
    const miliGerDate = gerDate.getTime();
    const todayDate = Date.now();
    const passedTime = (todayDate - miliGerDate) / (1000 * 3600 * 24);


    const wichSprite = () => {
            if(passedTime>=0 && passedTime<=30){
                return <img id="plant" src={sprite1} alt="plant icon" />
            } else if(passedTime>=30 && passedTime<=60){
                return <img id="plant" src={sprite2} alt="plant icon" />
            } else if(passedTime>=60 && passedTime<=90){
                return <img id="plant" src={sprite3} alt="plant icon" />
            } else if(passedTime>=90 && passedTime<=120){
                return <img id="plant" src={sprite4} alt="plant icon" />
            } else if(passedTime>=120 && passedTime<=180){
                return <img id="plant" src={sprite5} alt="plant icon" />
            } else if(passedTime>=180){
                return <img id="plant" src={sprite6} alt="plant icon" />
            }
    }

    const eht = () => {
        if(plant.genetic==='Indica'){
            const result = new Date(miliGerDate + 15552000000)
            const resultDate = result.toLocaleDateString('en-GB');
            return <p>{resultDate}</p>
        }else if(plant.genetic==='Sativa'){
            const result = new Date(miliGerDate + 19008000000)
            const resultDate = result.toLocaleDateString('en-GB');
            return <p>{resultDate}</p>
        }else if(plant.genetic==='Sativa-dominating breed'){
            const result = new Date(miliGerDate + 17280000000)
            const resultDate = result.toLocaleDateString('en-GB');
            return <p>{resultDate}</p>
        }else if(plant.genetic==='Indica-dominating breed'){
            const result = new Date(miliGerDate + 16416000000)
            const resultDate = result.toLocaleDateString('en-GB');
            return <p>{resultDate}</p>
        }
    }

    tippy('#tooltip', {
        content: "Estimated Harvest Time",
        placement: "bottom-end",
        animation: "scale"
      });

    //idear una forma de que haya un tope natural, es decir, ninguna planta puede cosecharse despues del 1 de junio, un condicional que evalue el tiempo que paso desde que se germino o que incluya un tope, la condicion a evaluar sigue siendo la fecha de germinacion

    return (
        <>
        {isOpen &&
            <Modal setIsOpen={setIsOpen} modalTitle={!confirm ? "Are you sure you want to delete this plant?" : "Plant successfully deleted"}>
                {confirm ? <p>{plantName} was deleted</p> : <p>This action cannot be undone</p> }
                <div className='addModalButtons'>
                    <button onClick={()=>deletePlant(ID, plantName)} className={confirm? "disabled" : null}>Delete</button>
                    <Link to={'/plants'}>
                        <span onClick={handleClose}>{!confirm? 'Cancel' : 'Go back'}</span>
                    </Link>
                </div>
            </Modal>}
        <div className="all_plant">
            {/* <button onClick={()=>{console.log('a ver: ', numberDate)}}>aver</button> */}
            <div className="card">
                <div className="card_header">
                    <h2>{plant.plant_name}</h2>
                    <div className="plantHeadersButtons">
                        <Link to={`/edit-plant/${plant._id}`}>
                            <BsFillPencilFill className="icon" />
                        </Link>
                        <GoTrashcan className="icon" onClick={()=>{handleChange(plant._id, plant.plant_name)}}/>
                    </div>
                </div>
                <div className="card_body">
                <p>{wichSprite()}</p>
                <div className="card_text">
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
                        <div className="plant_attribute">
                            <h4 id='tooltip'>E.H.T</h4>
                            <span>{eht()}</span>
                        </div>
                    </div>
                </div>
            </div>
            <button className='button' onClick={()=>navigate(-1)}>Go back</button>
        </div>
        <Footer/>
        </>
    )
};