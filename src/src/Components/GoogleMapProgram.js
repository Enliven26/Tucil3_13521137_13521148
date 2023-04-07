import { useState, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const libraries = ['geometry', 'drawing', 'places']

const GoogleMapProgram = ({setLoading, showPopUp}) => {
    
    // program states
    const [sourceNode, setSourceNode] = useState(null);
    const [targetNode, setTargetNode] = useState(null);
    const [adjMatrix, setMatrix] = useState(null);
    // handlers

    const handleSolve = async (e) => {
        e.preventDefault();

        setLoading(true);

        setLoading(false);
    }

    const containerStyle = {
        overflow: 'hidden',
        width: '100%',
        height: '500px',
        borderRadius: '10px',
        borderColor: '#f1356d',
        borderWidth: '4px',
        borderStyle: "solid",
        marginBottom: "20px",
    };

    const center = {lat: -6.8915, lng: 107.6107}

    const [map, setMap] = useState(null);

    const resetCenter = (e) => {
        e.preventDefault();
        
        map.setCenter(center);
    }

    const clearMark = (e) => {
        e.preventDefault();
    }

    const options = {
        streetViewControl: false,
        mapTypeControl: false,
        disableDoubleClickZoom: true,
        minZoom:10,
        maxZoom:18,
        scrollwheel: true,
    }

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GMAP_API,
        libraries: libraries
    });

    return ( 
        <div className='program'>
            <h2>Google Map App</h2>

            <div className="gmap display">
                {
                    loadError && <span className='note'>{"Error occured while loading google map: " + loadError.message}</span>
                }
                {isLoaded &&
                    <>
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={16}
                            tilt={0}
                            options={{
                                streetViewControl: false,
                                mapTypeControl: false,
                                disableDoubleClickZoom: true,
                                minZoom:10,
                                maxZoom:18,
                                scrollwheel: true,
                            }}
                            onLoad={(mapRef) => setMap(mapRef)}
                        >
                            { /* Child components, such as markers, info windows, etc. */ }
                            <>
                            </>
                        </GoogleMap>

                        <div className='tools'>
                            <button
                                onClick={resetCenter}
                                type='button'
                            >
                            Reset Position
                            </button>

                            <button
                                onClick={clearMark}
                                type='button'
                            >
                            Clear Marks
                            </button>
                        </div>
                    </>
                }
            </div>

            <form>
                {adjMatrix && <div>
                    <label>Source Node :</label>
                    <select value={sourceNode} onChange={(e) => {e.preventDefault(); setSourceNode(e.target.value)}}>
                        {
                            adjMatrix.map((_, index) => {
                                return(
                                    <option key={"source" + index}>
                                        Node {index+1}
                                    </option>
                                )
                            })
                        }
                    </select>

                    <label>Target Node :</label>
                    <select value={targetNode} onChange={(e) => {e.preventDefault(); setTargetNode(e.target.value)}}>
                        {
                            adjMatrix.map((_, index) => {
                                return(
                                    <option key={"target" + index}>
                                        Node {index+1}
                                    </option>
                                )
                            })
                        }
                    </select>

                    <button type="button" onClick={handleSolve}>Solve</button>
                </div>}

            </form>
            
        </div>
     );
}
 
export default GoogleMapProgram;