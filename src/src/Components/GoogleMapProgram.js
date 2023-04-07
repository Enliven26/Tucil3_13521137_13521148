import { useState, useRef, useEffect } from "react";
import ConfigMap from "./ConfigMap";
import GMap from "./GMap";

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
        return ( 
        <div className='program'>
            <h2>Google Map App</h2>

            <GMap></GMap>
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