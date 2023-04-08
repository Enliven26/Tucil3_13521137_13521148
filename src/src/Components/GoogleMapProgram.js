import { useState, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, DrawingManager, DirectionsRenderer } from '@react-google-maps/api';
import { v4 as uuid } from 'uuid';

const libraries = ['geometry', 'drawing', 'places']

const GoogleMapProgram = ({setLoading, showPopUp}) => {
    
    // constant configuration
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

    // const options = {
    //     streetViewControl: false,
    //     mapTypeControl: false,
    //     disableDoubleClickZoom: true,
    //     minZoom:10,
    //     maxZoom:18,
    //     scrollwheel: true,
    // }

    const center = {lat: -6.8915, lng: 107.6107}
    const zoom = 16;

    const getMarkerUrl = (color) => {
        return `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`
    }

    // program states
    const [sourceMarker, setSourceMarker] = useState(/** @type google.maps.Marker */ null);
    const [targetMarker, setTargetMarker] = useState(/** @type google.maps.Marker */ null);
    const [adjMatrix, setMatrix] = useState(null);
    const [drawingManager, setDrawingManager] = useState(/** @type google.maps.drawing.DrawingManager */ (null));
    const [map, setMap] = useState(/** @type google.maps.Map */ (null));
    const [disableSolve, setDisableSolve] = useState(true);
    const [directionResults, setDirectionResults] = useState([]);

    // program refs
    const solutionMode = useRef(false);
    const markers = useRef([]);
    const selectedMarker = useRef(/** @type google.maps.Marker */ (null));
    const directionResultsRef = useRef([]);

    // handlers

    const handleSolve = async (e) => {
        e.preventDefault();

        setLoading(true);

        setLoading(false);
    }

    const resetCenter = (e) => {
        e.preventDefault();
        
        if (map) {
            map.panTo(center);
            map.setZoom(zoom);
        }
    }

    const clearAll = (e) => {
        e.preventDefault();

        const deletedMarkerIds = [];

        for(var i = 0; i < markers.current.length; i++)
        {
            deletedMarkerIds.push(markers.current[i].id)
            markers.current[i].setMap(null);
        }

        markers.current = [];
        
        directionResultsRef.current = directionResultsRef.current.filter(
            (resultObj) => !deletedMarkerIds.includes(resultObj.firstId) && !deletedMarkerIds.includes(resultObj.secondId)
        );
        
        setDirectionResults(directionResultsRef.current);

        stopSolutionMode(null);
    }

    const clearMark = (marker) => {

        directionResultsRef.current = directionResultsRef.current.filter((resultObj) => resultObj.firstId !== marker.id && resultObj.secondId !== marker.id);

        setDirectionResults(directionResultsRef.current);
        marker.setMap(null);
        markers.current = markers.current.filter((ref) => ref.id !== marker.id);
        selectedMarker.current = null;
    }

    const addMarker = (marker) => {

        if (selectedMarker.current)
        {
            unselectCurrentMark();
        }
        
        marker.setIcon(getMarkerUrl("green"));
        marker.id = uuid();
    
        marker.addListener("click", (event) => {

            if (solutionMode.current) return;
            if (selectedMarker.current)
            {
                // delete marker
                if (selectedMarker.current.id === marker.id)
                {
                    clearMark(marker);
                }
                
                // create path between 2 markers
                else
                {
                    calculateEdge(selectedMarker.current, marker);
                    unselectCurrentMark();
                }
                
            }
            
            // select marker
            else
            {
                marker.setIcon(getMarkerUrl("blue"));
                selectedMarker.current = marker;
            }
        })

        markers.current = [...markers.current, marker];
    }

    const calculateEdge = async (startMarker, endMarker) => {

        setLoading(true);

        const foundIdx = directionResultsRef.current.findIndex(
            (resultObj) => (resultObj.firstId === startMarker.id && resultObj.secondId === endMarker.id) 
                           || (resultObj.firstId === endMarker.id && resultObj.secondId === startMarker.id)
        )
        
        if (foundIdx !== -1)
        {
            directionResultsRef.current = directionResultsRef.current.filter((_, index) => index !== foundIdx)
            setDirectionResults(directionResultsRef.current);
        }

        else 
        {
            // eslint-disable-next-line no-undef
            const directionsService = new google.maps.DirectionsService();

            await directionsService.route({
                origin: startMarker.getPosition(),
                destination: endMarker.getPosition(),
                // eslint-disable-next-line no-undef
                travelMode: google.maps.TravelMode.DRIVING
            }, (/** @type google.maps.DirectionsResult */ result, /** @type google.maps.DirectionsStatus */ status) => {
                
                if (status === "OK") {
                    directionResultsRef.current = [...directionResultsRef.current, {firstId: startMarker.id, secondId: endMarker.id, result: result}];
                    setDirectionResults(directionResultsRef.current);
                }

                else
                {
                    showPopUp(status, "Error while calculating edge between 2 selected markers!");
                }
            })
        }
        setLoading(false);
    }

    const unselectCurrentMark = () => {
        selectedMarker.current.setIcon(getMarkerUrl("green"));
        selectedMarker.current = null;
    }

    const handleMapClick = (event) => {
        if (selectedMarker.current)
        {
            unselectCurrentMark();
        }

    }

    const toggleMode = (event) => {
        event.preventDefault();

        if (solutionMode.current)
        {
            stopSolutionMode(null);
        }

        else
        {
            startSolutionMode(null);
        }

    }

    const stopSolutionMode = (event) => {
        if (event)
        {
            event.preventDefault();
        }

        if (drawingManager)
        {
            drawingManager.setOptions({
                drawingControlOptions: {
                    drawingModes: ['marker']
                }
            })
        }

        solutionMode.current = false;
    }

    const startSolutionMode = (event) => {

        if (event)
        {
            event.preventDefault();
        }

        if (drawingManager)
        {
            drawingManager.setOptions({
                drawingControlOptions: {
                    drawingModes: [null],
                }
            })

            drawingManager.setDrawingMode(null);
        }

        solutionMode.current = true;
    }

    // load google map
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
                            zoom={zoom}
                            tilt={0}
                            options={{
                                streetViewControl: false,
                                mapTypeControl: false,
                                disableDoubleClickZoom: true,
                                minZoom:10,
                                maxZoom:18,
                                scrollwheel: true,
                                clickableIcons: true,
                            }}
                            onLoad={(mapRef) => setMap(mapRef)}
                            onClick={handleMapClick}

                        >
                            <DrawingManager
                                onLoad={(manager) => {setDrawingManager(manager)}}
                                onMarkerComplete={addMarker}
                                options={{
                                    drawingControlOptions: {
                                        drawingModes: solutionMode.current? [null] : ['marker']
                                    }
                                }}

                            />

                            {
                                directionResults.map((resultObj) => 
                                    <DirectionsRenderer 
                                        key={resultObj.firstId + resultObj.secondId}
                                        directions={resultObj.result}
                                        options={{
                                            suppressMarkers: true,
                                        }}
                                    />
                                )
                            }

                        </GoogleMap>

                        <div className='tools'>
                            <button
                                className="fix-width-button"
                                title="Set current map center to initial default location"
                                onClick={resetCenter}
                                type='button'
                            >
                            Reset Position
                            </button>

                            <button
                                className="fix-width-button"
                                title="Clear marks on current map and start editing mode"
                                onClick={clearAll}
                                type='button'
                            >
                            Clear Marks
                            </button>
                         
                            <button
                                className="fix-width-button"
                                title="Switch between editing mode and solution mode (solution mode allows user to choose 2 marks in order to find the shortest path)"
                                onClick={toggleMode}
                                type='button'
                            >
                            Toggle Mode
                            </button>

                            <button
                                className="fix-width-button"
                                title="Find shortest path between 2 selected marks in solution mode"
                                onClick={toggleMode}
                                type='button'
                                disabled={disableSolve}
                            >
                            Solve
                            </button>
                            
                        </div>
                    </>
                }
            </div>
        </div>
     );
}
 
export default GoogleMapProgram;