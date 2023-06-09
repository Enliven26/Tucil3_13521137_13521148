import { useState, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, DrawingManager, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { v4 as uuid } from 'uuid';
import Readme from "./Readme";
import { AyStar, UniformCostSearch } from "../Algorithms/PathFinding";

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
        margin: "0px",
        padding: "0px",
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

    const zoom = 16;

    const getMarkerUrl = (color) => {
        return `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`
    }

    // program states
    const [drawingManager, setDrawingManager] = useState(/** @type google.maps.drawing.DrawingManager */ (null));
    const [map, setMap] = useState(/** @type google.maps.Map */ (null));
    const [disableSolve, setDisableSolve] = useState(true);
    const [directionResults, setDirectionResults] = useState([]);
    const [algorithm, setAlgorithm] = useState(0);
    const [solutionDirectionResults, setSolutionDirectionResult] = useState([]);
    const [solutionInfo, setSolutionInfo] = useState(null);
    const [infoWindow, setInfoWindow] = useState(/** @type google.maps.InfoWindow */(null));
    const [showReadme, setShowReadme] = useState(false);
    const [latitudeCenter, setLatitudeCenter] = useState(-6.8915);
    const [longitudeCenter, setLongitudeCenter] = useState(107.6107);
    const [latitudeCenterHolder, setLatitudeCenterHolder] = useState("-6.8915");
    const [longitudeCenterHolder, setLongitudeCenterHolder] = useState("107.6107");

    // program refs
    const solutionMode = useRef(false);
    const markers = useRef([]);
    const selectedMarker = useRef(/** @type google.maps.Marker */ (null));
    const directionResultsRef = useRef([]);
    const solutionMarkers = useRef([]);

    // handlers    

    // returns 2 markers straight line distance in meter

    const getMarkerStraightLineDistance = (firstMarker, secondMarker) => {
        var R = 6371.0710; // Radius of the Earth in km
        var rlat1 = firstMarker.position.lat() * (Math.PI/180); // Convert degrees to radians
        var rlat2 = secondMarker.position.lat() * (Math.PI/180); // Convert degrees to radians
        var difflat = rlat2-rlat1; // Radian difference (latitudes)
        var difflon = (secondMarker.position.lng()-firstMarker.position.lng()) * (Math.PI/180); // Radian difference (longitudes)

        var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
        return d * 1000;

    }

    const handleSolve = (e) => {
        e.preventDefault();

        if (solutionMarkers.current.length < 2)
        {
            showPopUp({title:"Invalid Data Error", message:"Select two markers to search for solution!"})
            return;
        }

        setLoading(true);

        const startMarkerIdx = markers.current.findIndex(marker => marker.id === solutionMarkers.current[0].id);
        const endMarkerIdx = markers.current.findIndex(marker => marker.id === solutionMarkers.current[1].id);
        const adjMatrix = [];
        const heuristicValues = [];

        markers.current.forEach(firstMarker => {

            const adjRow = [];

            markers.current.forEach(secondMarker => {

                const foundIdx = directionResultsRef.current.findIndex(
                    (resultObj) => resultObj.firstId === firstMarker.id && resultObj.secondId === secondMarker.id
                );

                if (firstMarker.id === secondMarker.id)
                {
                    adjRow.push("0");
                }

                else if (foundIdx !== -1)
                {
                    adjRow.push(directionResultsRef.current[foundIdx].result.routes[0].legs[0].distance.value.toString())
                }

                else
                {
                    adjRow.push("X");
                }
            });

            adjMatrix.push(adjRow);
        });

        markers.current.forEach((marker) => {
            heuristicValues.push(getMarkerStraightLineDistance(marker, solutionMarkers.current[1]))
        })
        
        var pathFindingResults;
        if (algorithm === 0) {
            pathFindingResults = UniformCostSearch(adjMatrix, startMarkerIdx, endMarkerIdx);
        }
        else if (algorithm === 1) {
            pathFindingResults = 
                AyStar(adjMatrix, startMarkerIdx, endMarkerIdx, {distanceToDest: heuristicValues});
        }
        const solution = pathFindingResults.solution;
        
        const temp = [];

        solution.forEach((val, idx) => {

            if (idx < solution.length-1)
            {
                const firstMarker = markers.current[val];
                const secondMarker = markers.current[solution[idx+1]];

                temp.push(directionResultsRef.current.filter(
                    (resultObj) => resultObj.firstId === firstMarker.id && resultObj.secondId === secondMarker.id
                )[0])
            }
        });  

        // console.log(heuristicValues);
        console.log(adjMatrix);

        const coords = [];

        markers.current.forEach((marker) => coords.push([marker.getPosition().lat(), marker.getPosition().lng()]))

        console.log(coords);
        // console.log(solution);
        // console.log(pathFindingResults.distance)
        
        setSolutionInfo({
            position: solutionMarkers.current[1].getPosition(),
            distance: pathFindingResults.distance,
            solution: solution,
        })

        setSolutionDirectionResult(temp);

        if (infoWindow)
        {
            infoWindow.open({
                anchor: solutionMarkers.current[1]
            });
        }
        setLoading(false);
    }

    const enterKeyHandler = (e) => {
        if (e.key === 'Enter')
        {
            e.currentTarget.blur();
        }
    }

    const resetCenter = (e) => {
        if (e) e.preventDefault();
        
        if (map) {
            map.panTo({lat: latitudeCenter, lng: longitudeCenter});
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

    const addMarker = (/** @type google.maps.Marker */ marker) => {

        if (selectedMarker.current)
        {
            unselectCurrentMark();
        }
        marker.setZIndex(1);
        marker.setIcon(getMarkerUrl("green"));
        marker.id = uuid();
    
        marker.addListener("click", (event) => {

            if (solutionMode.current)
            {
                if (solutionMarkers.current.length)
                {
                    const foundIdx = solutionMarkers.current.findIndex((elmt) => elmt.id === marker.id)

                    // unselect marker
                    if (foundIdx !== -1)
                    {
                        solutionMarkers.current.splice(foundIdx, 1);
                        unselectMark(marker);
                    }
                    
                    // select target marker
                    else
                    {
                        solutionMarkers.current.push(marker);

                        if (solutionMarkers.current.length > 2)
                        {
                            unselectMark(solutionMarkers.current[0]);
                            solutionMarkers.current.splice(0, 1);
                        }

                        marker.setIcon(getMarkerUrl("blue"));
                    }
                    
                }
                
                // select source marker
                else
                {
                    marker.setIcon(getMarkerUrl("blue"));
                    solutionMarkers.current.push(marker);
                }
            }

            else
            {
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
            } 
        })

        markers.current = [...markers.current, marker];
    }

    const calculateEdge = async (startMarker, endMarker) => {

        const foundIdx = directionResultsRef.current.findIndex(
            (resultObj) => (resultObj.firstId === startMarker.id && resultObj.secondId === endMarker.id)
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

            setLoading(true);

            await directionsService.route({
                origin: startMarker.getPosition(),
                destination: endMarker.getPosition(),
                // eslint-disable-next-line no-undef
                travelMode: google.maps.TravelMode.DRIVING
            }, (/** @type google.maps.DirectionsResult */ result, /** @type google.maps.DirectionsStatus */ status) => {
                
                setLoading(false);

                if (status === "OK") {
                    directionResultsRef.current = [...directionResultsRef.current, {firstId: startMarker.id, secondId: endMarker.id, result: result}];
                    setDirectionResults(directionResultsRef.current);
                }

                else
                {
                    showPopUp({title:status, message:"Error while calculating edge between 2 selected markers!"})
                }
            })

            .catch((e) => {})
        }
    }

    const unselectCurrentMark = () => {

        if (selectedMarker.current)
        {
            unselectMark(selectedMarker.current)
            selectedMarker.current = null;
        }
    }

    const unselectMark = (marker) => {
        marker.setIcon(getMarkerUrl("green"));
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

        resetCenter(null);

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

        if (infoWindow)
        {
            infoWindow.close();
        }

        unselectCurrentMark();
        solutionMode.current = false;

        solutionMarkers.current.forEach((marker) => {
            unselectMark(marker);
        })

        solutionMarkers.current = [];
        if (solutionDirectionResults.length) setSolutionDirectionResult([]);
        setDisableSolve(true);
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

        unselectCurrentMark();
        solutionMode.current = true;
        setDisableSolve(false);
    }

    useEffect(() => {
        if (process.env.REACT_APP_GMAP_API === undefined)
        {
            showPopUp({title:"Undefined API Key", message:".env file containing REACT_APP_GMAP_API=YOUR_GOOGLE_MAP_API_KEY is needed! (.env file should be located inside the outermost src folder)"})
        }
    }, [])

    // load google map
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GMAP_API,
        libraries: libraries
    });


    return ( 
        <div className='program'>
            <h2>Google Map App</h2>

            <button className="text-button"
                title="Clear marks on current map and start editing mode"
                onClick={(e) => setShowReadme(!showReadme)}
                type='button'
            >
            {showReadme? "Hide Documentation" : "Show Documentation"}
            </button>

            {showReadme &&
                <Readme/>
            }
            <div className="gmap display">

                {
                    loadError && <span className='note'>{"Error occured while loading google map: " + loadError.message}</span>
                }
                {isLoaded &&
                    <>
                        <div className="margin-top">
                            <div className="row-form">
                                <input
                                    className="number-input"
                                    placeholder="Latitude"
                                    type="text"
                                    step="any"
                                    value={latitudeCenterHolder}
                                    onChange={(e) => {
                                        e.preventDefault();
                                        setLatitudeCenterHolder(e.target.value);
                                    }}

                                    onBlur={(e) => {
                                        e.preventDefault();

                                        if (/^[+-]?\d+(\.\d+)?$/.test(e.target.value))
                                        {
                                            setLatitudeCenter(parseFloat(e.target.value));
                                        }

                                        else
                                        {
                                            showPopUp({title: "Center Value Error", message: "Latitude should be a number!"})
                                            setLatitudeCenterHolder(latitudeCenter);
                                        }
                                    }}

                                    onKeyDown={enterKeyHandler}
                                ></input>

                                <input
                                    className="number-input"
                                    placeholder="Longitude"
                                    type="text"
                                    step="any"
                                    value={longitudeCenterHolder}
                                    onChange={(e) => {
                                        e.preventDefault();

                                        setLongitudeCenterHolder(e.target.value);

                                    }}
                                    onBlur={(e) => {
                                        e.preventDefault();

                                        if (/^[+-]?\d+(\.\d+)?$/.test(e.target.value))
                                        {
                                            setLongitudeCenter(parseFloat(e.target.value));
                                        }

                                        else
                                        {
                                            showPopUp({title: "Center Value Error", message: "Longitude should be a number!"})
                                            setLongitudeCenterHolder(longitudeCenter);
                                        }
                                    }}
                                    onKeyDown={enterKeyHandler}
                                ></input>
                            </div>
                        </div>
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={{lat: latitudeCenter, lng: longitudeCenter}}
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
                           
                            <InfoWindow
                                onLoad={(window) => {setInfoWindow(window)}}
                                anchor={solutionMarkers.current.length === 2? solutionMarkers.current[1] : {lat: latitudeCenter, lng: longitudeCenter}}
                            >
                                <>
                                {solutionInfo &&
                                    <div className="info-window">
                                        <h3>{"Result" + (solutionInfo.solution.length === 0 ? " Not Found" : "")}</h3>
                                        {solutionInfo.solution.length > 0 &&
                                            <div>
                                                <span className="note">Shortest Distance: {solutionInfo.distance} m</span>  
                                                <span className="note"></span> 
                                            </div>
                                        }

                                        {solutionInfo.solution.length === 0 &&
                                                <span className="note">There is no path from source node to target node</span>  
                                        }
                                    </div>
                                }
                                </>
                                
                            </InfoWindow>

                            <DrawingManager
                                onLoad={(manager) => {setDrawingManager(manager)}}
                                onMarkerComplete={addMarker}
                                options={{
                                    drawingControlOptions: {
                                        drawingModes: solutionMode.current? [null] : ['marker']
                                    }
                                }}
                            />

                            {!solutionDirectionResults.length &&
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

                            {solutionDirectionResults.length > 0 && 
                                solutionDirectionResults.map((resultObj) => 
                                <DirectionsRenderer 
                                    key={"solution" +  resultObj.firstId + resultObj.secondId}
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
                                style={{
                                    color: solutionMode.current? "#f1356d" : "#fff",
                                    backgroundColor: solutionMode.current? "#fff" : "#f1356d",
                                    margin: solutionMode.current? "2px" : "0px",
                                    
                                }}
                            >
                            Toggle Mode
                            </button>

                            {!disableSolve && 
                                <div className="toggle-container">
                                    <button
                                    className="fix-width-button toggle-button"
                                    title="Use Uniform Cost Search algorithm to find the shortest path between 2 selected markers"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setAlgorithm(0);
                                    }}
                                    type='button'
                                    style={{
                                        color: algorithm === 0? "#f1356d" : "#fff",
                                        backgroundColor: algorithm === 0? "#fff" : "#f1356d",
                                        margin: "2px",
                                        borderTopLeftRadius: "20px",
                                        borderBottomLeftRadius: "20px",
                                        borderTopRightRadius: "0px",
                                        borderBottomRightRadius: "0px",
                                        width: "50px"
                                        
                                    }}
                                    >
                                    UCS
                                    </button>

                                    <button
                                    className="fix-width-button toggle-button"
                                    title="Use A Star algorithm to find the shortest path between 2 selected markers"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setAlgorithm(1);

                                    }}
                                    type='button'
                                    style={{
                                        color: algorithm === 1? "#f1356d" : "#fff",
                                        backgroundColor: algorithm === 1? "#fff" : "#f1356d",
                                        margin: "2px",
                                        borderTopLeftRadius: "0px",
                                        borderBottomLeftRadius: "0px",
                                        borderTopRightRadius: "20px",
                                        borderBottomRightRadius: "20px",
                                        width: "50px"
                                    }}
                                    >
                                    A*
                                    </button>
                                </div>
                            }

                            <button
                                className="fix-width-button"
                                title="Find shortest path between 2 selected marks in solution mode"
                                onClick={handleSolve}
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