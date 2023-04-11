const Readme = () => {
    return ( 
        <div className="readme">
            <h2>How to Use</h2>

            <div className="steps">
                <div className="step-content">
                    <h3>API Configuration</h3>
                    <label className="note">This application needs Google Map API Key to work. Google Map API Key is configured inside .env file located inside the outermost src folder with format REACT_APP_GMAP_API=Your_API_Key. <span>(Note: restart the app everytime .env file is changed!)</span></label>
                </div>

                <div className="step-content">
                    <h3>Select Mode</h3>
                    <label className="note">1. Click hand icon on the upper left side of the map to use select mode.</label>
                    <label className="note">2. Hold any button on mouse to drag the map.</label>
                    <label className="note">3. Single click a user-created marker to select it. The marker will turn blue (from default color green)</label>
                    <label className="note">4. After selecting a marker, click again the marker to delete it. This will also delete all edges/directions corresponding with the marker.</label>
                    <label className="note">5. After selecting a single marker, select another marker to create an edge between them. Mark that this program will generate directed-graph which means user needs to create 2 edges for the same markers if user wants to create edges for both directions.</label>
                    <label className="note">6. Select 2 markers with existing edge to delete the edge. <span>(Selection order is important!)</span></label>
                    <label className="note">7. In solution mode, select 2 markers to define start node and end node to search for shortest-path solution. <span>(Selection order is important!)</span></label>
                </div>

                <div className="step-content">
                    <h3>Draw Mode</h3>
                    <label className="note">1. Click marker icon on the upper left side of the map to use draw mode. This mode is disabled when user is in solution mode (read toggle mode button below).</label>
                    <label className="note">2. Click a position in map to create a marker on the exact position.</label>
                </div>

                <div className="step-content">
                    <h3>Reset Position Button</h3>
                    <label className="note">This button will move the camera to initial position. Current default center is Bandung Institute of Technology. You can change the default center above the map display in latitude and longitude format.</label>
                </div>

                <div className="step-content">
                    <h3>Clear Marks Button</h3>
                    <label className="note">This button will clear all drawn nodes and edges. If user is in solution mode, this button will make the program automatically enter the edit mode (read toggle mode button below). This button will also reset camera position.</label>
                </div>

                <div className="step-content">
                    <h3>Toggle Mode Button</h3>
                    <label className="note">This button will toggle the program between edit mode and solution mode. Edit mode allows user to add marks and edges before finding the solution where solution mode allows user to select 2 markers for defining start and end nodes. After displaying a solution (read solve button below), moving to edit mode will restore initial edges which are created right before the solution is calculated.</label>
                </div>

                <div className="step-content">
                    <h3>Algorithm Button</h3>
                    <label className="note">This button will determine the algorithm to use to find the solution. Algorithm button is hidden when user is in edit mode.</label>
                </div>

                <div className="step-content">
                    <h3>Solve Button</h3>
                    <label className="note">This button will calculate and visualize the shortest path solution between 2 markers. Solve button is disable in edit mode. If the user hasn't select 2 markers for start and end nodes, the program will send a pop-up message.</label>
                </div>
                
            </div>
        </div> 
    );
}
 
export default Readme;