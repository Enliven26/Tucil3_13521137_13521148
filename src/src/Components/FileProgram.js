import { useState, useRef, useEffect } from "react";
import ConfigMap from "./ConfigMap";

const FileProgram = ({setLoading, showPopUp}) => {
    
    // program states
    const [sourceNode, setSourceNode] = useState(null);
    const [targetNode, setTargetNode] = useState(null);
    const [configFile, setConfigFile] = useState(null);
    const [adjMatrix, setMatrix] = useState(null);

    // handlers
    const handleFileInput = async (event) => {

        setLoading(true)
        event.preventDefault();

        if (event.target.files[0] !== undefined)
        {
            var res = await readFile(event.target.files[0])

            if (res.success) {
                setConfigFile(event.target.files[0]);
                setMatrix(res.data)
            }

            else {
                showPopUp({title:"File Configuration Error", message:res.msg})
            }
        }

        setLoading(false)
    }

    const handleSolve = async (e) => {
        e.preventDefault();

        setLoading(true);

        setLoading(false);
    }

    const isConfigFileValid = (lines) => {
        if (!lines || lines.length === 0 || lines[0].length === 0) return {"success": false, "msg": "Configuration file is empty!"}

        const matrix = lines.map((line) => line.split(/\s+/))

        const row = matrix.length
        const column = matrix[0].length

        for (var i = 0; i < row; i++) {

            const line = matrix[i]

            if (line.length !== column) 
                    return {"success": false, 
                        "msg": "Configuration file contains rows with different length!"}

            for (var j = 0; j < column; j++) {

                var stringValue = line[j]

                if (!(stringValue.toUpperCase() === "X") && !(/^\d+$/.test(stringValue))) 
                    return {"success": false, 
                        "msg": "Configuration file contains invalid character(s)!\nNumbers and X's (case-insensitive) are the only valid characters"}
            }
        }

        if (row !== column) 
            return {"success": false, 
                "msg": "Adjancency matrix must have the same rows and columns count!"}

        for (j = 0; j < row; j++)
        {
            for (var k = 0; k < column; k++)
            {
                if (matrix[j][k] !== matrix[k][j])
                    return {"success": false, 
                        "msg": "Adjancency matrix should be symetric!"}

                if (j === k && parseInt(matrix[j][k]) !== 0)
                    return {"success": false, 
                        "msg": "Value in diagonal should be zero!"}
            }
        }

        return {"success": true, "msg": "Configuration File is valid", "data": matrix};
    }
    
    const readFile = async (file) => {
        
        var lines = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = async (e) => { 
                var res = (e.target.result).split(/\r?\n/);
                resolve(res);
            };

            reader.readAsText(file)
        })

        return isConfigFileValid(lines)

    }

    return ( 
        <div className='program'>
            <h2>File App</h2>

            {configFile && adjMatrix && <ConfigMap adjacencyMatrix={adjMatrix} configFile={configFile}/>}

            <form>
                <label className="inputFileLabel">
                    <span>Insert Configuration File</span>
                    <input
                        className="inputFile"
                        type="file"
                        accept=".txt"
                        onChange={(e) => handleFileInput(e)}
                        onClick={(e) => e.target.value = null}
                    ></input>
                </label>
                
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
 
export default FileProgram;