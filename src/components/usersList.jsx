import React, { useState } from "react";
import UserDetails from "./userDetails";

export default function UsersList() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  return (
    <div style={{ width: "95%", height: "100%", padding: "24px", position:'relative' }}>
      {showDetails&&<button onClick={()=>setShowDetails(false)} style={{position:'absolute', top:'0', right:'0'}}>close</button>}
      {!showDetails
        ? <div
            style={{
              width: "100%",
              height: "100%",
              padding: "24px",
              display: "flex",
              gap: "12px",
              flexWrap: "wrap"
            }}
          >
            <div
              style={{
                width: "200px",
                height: "200px",
                border: "1px solid gray",
                padding: "8px",
                borderRadius: "8px"
              }}
            >
              <h1>Employee 1</h1>
              <button onClick={()=>{setSelectedEmployeeId('employee1');setShowDetails(true)}}>Details</button>
            </div>
            <div
              style={{
                width: "200px",
                height: "200px",
                border: "1px solid gray",
                padding: "8px",
                borderRadius: "8px"
              }}
            >
              <h1>Employee 2</h1>
              <button onClick={()=>{setSelectedEmployeeId('employee2');setShowDetails(true)}}>Details</button>
            </div>
            <div
              style={{
                width: "200px",
                height: "200px",
                border: "1px solid gray",
                padding: "8px",
                borderRadius: "8px"
              }}
            >
              <h1>Employee 3</h1>
              <button onClick={()=>{setSelectedEmployeeId('employee3');setShowDetails(true)}}>Details</button>
            </div>
          </div>
        : <UserDetails selectedEmployeeId={selectedEmployeeId}/>}
    </div>
  );
}
