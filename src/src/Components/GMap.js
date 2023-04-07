import { GoogleMap, useJsApiLoader, LoadScript } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

const libraries = ['geometry', 'drawing', 'places']

const GMap = ({showPopUp}) => {

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
    );
}
 
export default GMap;