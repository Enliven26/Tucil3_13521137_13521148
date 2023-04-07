import { useState, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, DrawingManager, Data } from '@react-google-maps/api';
import { v4 as uuid } from 'uuid';

const libraries = ['geometry', 'drawing', 'places']

const GoogleMapProgram = ({setLoading, showPopUp}) => {
    
    // program states
    const [sourceNode, setSourceNode] = useState(null);
    const [targetNode, setTargetNode] = useState(null);
    const [adjMatrix, setMatrix] = useState(null);
    const [drawingManager, setDrawingManager] = useState(null);
    const [map, setMap] = useState(null);
    // const [data, setData] = useState(null);
    const markers = useRef([]);
    const selectedMarker = useRef(null);

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
    const zoom = 16;

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

    const clearMark = (e) => {
        e.preventDefault();
        if (markers.current.length)
        {
            
            for(var i = 0; i < markers.current.length; i++)
            {
                markers.current[i].setMap(null);
            }

            markers.current = [];
        }
    }

    const addMarker = (marker) => {
        marker.setIcon("http://maps.google.com/mapfiles/ms/icons/green-dot.png");
        marker.id = uuid();
    
        marker.addListener("click", (event) => {

            if (selectedMarker.current && selectedMarker.current.id === marker.id)
            {
                marker.setMap(null);
                markers.current = markers.current.filter((ref) => ref.id !== marker.id);
            }

            marker.setIcon("http://maps.google.com/mapfiles/ms/icons/blue-dot.png")

            selectedMarker.current = marker;

        })

        markers.current = [...markers.current, marker];
    }

    // const options = {
    //     streetViewControl: false,
    //     mapTypeControl: false,
    //     disableDoubleClickZoom: true,
    //     minZoom:10,
    //     maxZoom:18,
    //     scrollwheel: true,
    // }

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
                        >
                            {/* <Data
                                onLoad={(dataRef) => setData(dataRef)}
                                options={{
                                    controlPosition: window.google ? window.google.maps.ControlPosition.TOP_LEFT : undefined,
                                    controls: ["Point"],
                                    drawingMode: "Point", //  "LineString" or "Polygon".
                                    featureFactory: geometry => {
                                    console.log("geometry: ", geometry);
                                    },
                                    // Type:  boolean
                                    // If true, the marker receives mouse and touch events. Default value is true.
                                    clickable: true,

                                    // Type:  string
                                    // Mouse cursor to show on hover. Only applies to point geometries.
                                    // cursor: 'cursor',

                                    // Type:  boolean
                                    // If true, the object can be dragged across the map and the underlying feature will have its geometry updated. Default value is false.
                                    draggable: true,

                                    // Type:  boolean
                                    // If true, the object can be edited by dragging control points and the underlying feature will have its geometry updated. Only applies to LineString and Polygon geometries. Default value is false.
                                    editable: false,

                                    // Type:  string
                                    // The fill color. All CSS3 colors are supported except for extended named colors. Only applies to polygon geometries.
                                    fillColor: "#FF0055",

                                    // Type:  number
                                    // The fill opacity between 0.0 and 1.0. Only applies to polygon geometries.
                                    fillOpacity: 1,

                                    // Type:  string|Icon|Symbol
                                    // Icon for the foreground. If a string is provided, it is treated as though it were an Icon with the string as url. Only applies to point geometries.
                                    // icon: 'icon',

                                    // Type:  MarkerShape
                                    // Defines the image map used for hit detection. Only applies to point geometries.
                                    shape: {
                                        coords: [60,0, 90,15, 120,60, 90,120, 60, 180, 30,120, 0,60, 30,15, 60,0],
                                        type: 'poly'
                                    
                                    },

                                    // Type:  string
                                    // The stroke color. All CSS3 colors are supported except for extended named colors. Only applies to line and polygon geometries.
                                    strokeColor: "#00FF55",

                                    // Type:  number
                                    // The stroke opacity between 0.0 and 1.0. Only applies to line and polygon geometries.
                                    strokeOpacity: 1,

                                    // Type:  number
                                    // The stroke width in pixels. Only applies to line and polygon geometries.
                                    strokeWeight: 2,

                                    // Type:  string
                                    // Rollover text. Only applies to point geometries.
                                    title: "Title",

                                    // Type:  boolean
                                    // Whether the feature is visible. Defaults to true.
                                    visible: true,

                                    // Type:  number
                                    // All features are displayed on the map in order of their zIndex, with higher values displaying in front of features with lower values. Markers are always displayed in front of line-strings and polygons.
                                    zIndex: 0
                                }}
                            /> */}
                            <DrawingManager
                                onLoad={(manager) => setDrawingManager(manager)}
                                onMarkerComplete={addMarker}
                                options={{
                                    drawingControlOptions: {
                                        drawingModes: ['marker']
                                    }
                                }}

                            />

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