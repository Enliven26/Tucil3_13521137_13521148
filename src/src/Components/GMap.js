import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const GMap = () => {

    const containerStyle = {
        overflow: 'hidden',
        width: '100%',
        height: '500px',
        borderRadius: '10px',
        borderColor: '#f1356d',
        borderWidth: '4px',
        borderStyle: "solid",
    };

    const center = {
        lat: -3.745,
        lng: -38.523
    };

    const gmapAPI = process.env.REACT_APP_GMAP_API;

    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        // googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${gmapAPI}&v=3.exp&libraries=geometry,drawing,places`,
        googleMapsApiKey: gmapAPI,
        libraries: ['geometry', 'drawing', 'places'],
    });

    return ( 
        <div className="gmap display">
            {isLoaded &&
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={10}
                >
                    { /* Child components, such as markers, info windows, etc. */ }
                    <></>
                </GoogleMap>
            }
        </div>
    );
}
 
export default GMap;