import React, { useContext, useEffect ,useState} from "react";
import { Col, ListGroup,Button, Row ,Modal,Form} from "react-bootstrap";
import { useDispatch, useSelector} from "react-redux";
import { AppContext } from "../context/appContext";
import { addNotifications, resetNotifications } from "../features/userSlice";
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./Sidebar.css";
import "@fortawesome/fontawesome-free/css/all.min.css";





function Sidebar() {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { socket, setMembers, members, setCurrentRoom, setRooms, privateMemberMsg, rooms, setPrivateMemberMsg, currentRoom } = useContext(AppContext);
  

     const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groups, setGroups] = useState([]);  // To store the list of groups

 // Fetch all groups from the backend when the component is mounted or user logs in
 useEffect(() => {
  if (user) {
    setCurrentRoom("Family"); // Default room
    getRooms(); // Fetch rooms
    getMembers(); // Fetch members
    socket.emit("join-room", "Family"); // Join default room
    socket.emit("new-user"); // Notify server about the new user
  }
}, [user]);

// Fetch available rooms (groups) from the backend
function getRooms() {
  fetch("https://lightningchat-backend.onrender.com/api/groups") // Updated the endpoint to fetch groups
    .then((res) => res.json())
    .then((data) => setGroups(data)) // Set groups in state
    .catch((error) => console.error("Error fetching groups:", error));
}

// Fetch available members (users) from the backend
function getMembers() {
  fetch("https://lightningchat-backend.onrender.com/api/users")
    .then((res) => res.json())
    .then((data) => setMembers(data))
    .catch((error) => console.error("Error fetching members:", error));
}

    function joinRoom(room, isPublic = true) {
      if (!user) {
          return alert("Please login");
      }
      socket.emit("join-room", room, currentRoom);
      setCurrentRoom(room);

      if (isPublic) {
          setPrivateMemberMsg(null);
      }
      dispatch(resetNotifications(room));
  }
  // Listen for new group creation via socket
  socket.off("new-group").on("new-group", (newGroup) => {
    // Add the newly created group to the list of rooms
    setGroups((prevGroups) => [...prevGroups, newGroup]); // Add new group to state
  });
  socket.off("notifications").on("notifications", (room) => {
    if (currentRoom != room) dispatch(addNotifications(room));
});

function handlePrivateMemberMsg(member) {
  setPrivateMemberMsg(member);
  const roomId = orderIds(user._id, member._id);
  joinRoom(roomId, false);
}

function orderIds(id1, id2) {
  if (id1 > id2) {
      return id1 + "-" + id2;
  } else {
      return id2 + "-" + id1;
  }
}

 // Handle creating a new group
 function handleGroupCreation() {
  if (!groupName || selectedMembers.length === 0) {
    alert("Group name and members are required.");
    return;
  }
  const groupData = {
    name: groupName,
    members: selectedMembers,
  };

    // Send group data to the backend to create the new group
    fetch("https://lightningchat-backend.onrender.com/api/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groupData),
    })
      .then((res) => res.json())
      .then((newGroup) => {
        // Add the new group to the list of groups
        setGroups((prevGroups) => [...prevGroups, newGroup]);
        setShowGroupModal(false); // Close the modal after group creation
      })
      .catch((error) => {
        console.error("Error creating group:", error);
      });
  }

   
  // Handle member selection for the group
  function handleMemberSelection(e, member) {
    if (e.target.checked) {
      setSelectedMembers((prev) => [...prev, member._id]);
    } else {
      setSelectedMembers((prev) => prev.filter((id) => id !== member._id));
    }
  }


    

 
  if(!user){
    return <> </>
  }


  return (
  
    <>
      <h2>Available Groups</h2>
      <ListGroup>
        {groups.length > 0 ? (
          groups.map((group, idx) => (
            <ListGroup.Item
              key={idx}
              onClick={() => joinRoom(group.name)}
              active={group.name === currentRoom}
              style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
            >
              {group.name}{currentRoom !== group.name && <span className="badge rounded-pill bg-primary">{user.newMessages[group.name]}</span>}

            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item>No available groups</ListGroup.Item>
        )}
      </ListGroup>

      <Button
        variant="primary"
        onClick={() => setShowGroupModal(true)} // Open modal for creating groups
      >
         Create Group
      </Button>

      {/* Modal for creating a group */}
      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formGroupName">
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Select Members</Form.Label>
              {members.map((member) => (
                <div key={member._id}>
                  <Form.Check
                    type="checkbox"
                    label={member.name}
                    onChange={(e) => handleMemberSelection(e, member)}
                  />
                </div>
              ))}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowGroupModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleGroupCreation}>
            Create Group
          </Button>
        </Modal.Footer>
      </Modal>

      <h2>Members</h2>
      <ListGroup>
        {members.map((member) => (
          <ListGroup.Item
            key={member._id}
            style={{ cursor: "pointer" }}
            onClick={() => handlePrivateMemberMsg(member)}
            disabled={member._id === user._id}
          >
            <Row>
              <Col xs={2} className="member-status">
                <img src={member.picture} className="member-status-img" alt="status" />
                {member.status === "online" ? (
                  <i className="fas fa-circle sidebar-online-status"></i>
                ) : (
                  <i className="fas fa-circle sidebar-offline-status"></i>
                )}
              </Col>
              <Col xs={9}>
                {member.name}
                {member._id === user._id && " (You)"}
                {member.status === "offline" && " (Offline)"}
              </Col>
              <Col xs={1}>
                <span className="badge rounded-pill bg-primary">
                  {user.newMessages[orderIds(member._id, user._id)]}
                </span>
              </Col>
            </Row>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  
  
  
  
);
};

export default Sidebar;
