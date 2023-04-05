import { useNavigate } from 'react-router-dom';

const NavBar = ({isloading, setloading}) => {
    const navigate = useNavigate();
    return ( 
        <div className="navbar">
            <h2>[NAMA APP KITAAAAA]</h2>

            <div className='menus'>
                <button className='links' onClick={() => navigate("/app")}>App</button>
            </div>
            
        </div>
     );
}
 
export default NavBar;