import { useNavigate } from "react-router-dom";

const PopUp = ({title, message, to, setPopUp, isLoading, popUp}) => {

    const navigate = useNavigate();

    const closePopUp = () => {
        if (to) {
            navigate(to);
        }
        setPopUp(false);
        popUp.state = false;
    }
    return ( 
        <div className="popup">
            <div className="overlay"></div>
            <div className="popup-content">
                <h3>{title}</h3>
                <p>
                    {message}
                </p>

                {!isLoading && <button className="popup-button"onClick={closePopUp}>Close</button>}
            </div>
        </div>
     );
}
 
export default PopUp;