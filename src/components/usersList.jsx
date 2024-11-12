import React, { useState } from "react";
import UserDetails from "./userDetails";
import './styles.css'

const SampleData = [
  { id: "employee1", name: "Employee 1" },
  { id: "employee2", name: "Employee 2" },
  { id: "employee3", name: "Employee 3" },
  { id: "employee4", name: "Employee 4" },
  { id: "employee5", name: "Employee 5" }
];
const colors = ["#AEC6CF", "#FFDAB9", "#FFB6C1", "#C5E384", "#E6E6FA", "#F0E68C"];
export default function UsersList() {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  return (
    <div
      style={{
        width: "95%",
        height: "85vh",
        padding: "24px",
        display: "flex",
        gap:'24px'
      }}
    >
      <div style={{ width: "20%", height: "100%" }}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            gap: "12px",
            flexDirection: "column",
            justifyContent: "space-between",
            overflowY:'auto'
          }}
        >
          {SampleData?.map((employee,index) => (
            <div
              style={{  
                border: "1px solid gray",
                padding: "8px",
                borderRadius: "8px",
                textAlign: "center",
                cursor:'pointer',
             
              }}
              className="employee-card"
              onClick={() => {
                setSelectedEmployeeId(employee.id);
                setShowDetails(true);
              }}
            >
                
              <h1 style={{ color: colors[index % colors.length] }}>{employee.name}</h1>
             
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          width: "50%",
          height: "94%",
          padding: "24px",
          border: "1px solid gray",
          borderRadius: "8px",
          position:'relative'
        }}
      >
         {showDetails&&<button onClick={()=>setShowDetails(false)} style={{position:'absolute', top:'5px', right:'5px'}}>❌</button>}
        {!showDetails ? (
          <h1 style={{textAlign:'center'}}>Choose employee to view the details</h1>
        ) : (
          <UserDetails selectedEmployeeId={selectedEmployeeId} />
        )}
      </div>
    </div>
  );
}
