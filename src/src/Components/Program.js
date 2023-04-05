import { Link } from 'react-router-dom';
const Program = () => {
    return ( 
        <div className="home">
            <h2>Input Methods</h2>
            <Link className='links' to="./using-file">File Configuration</Link>
            <Link className='links' to="./using-gmap">Google Map</Link>
        </div>
     );
}
 
export default Program;