import { useSelector } from "react-redux";
import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faPaperclip } from "@fortawesome/free-solid-svg-icons"; // Add paperclip icon for attachments
import { Col, ListGroup, Row, Button, Form } from "react-bootstrap";
import "./MessageForm.css";
import { AppContext } from "../context/appContext";
import io from "socket.io-client";

const socket = io("https://your-backend-url.com");  // Replace with your backend URL

function MessageForm() {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null); // State to store the attached file
  const user = useSelector((state) => state.user);
  const { currentRoom, setMessages, messages, privateMemberMsg } = useContext(AppContext);
  const messageEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle incoming messages from the server
  useEffect(() => {
    socket.on("room-messages", (roomMessages) => {
      console.log("Received room messages", roomMessages);
      setMessages(roomMessages);  // Update state with new messages
    });

    // Clean up socket event listener on unmount
    return () => {
      socket.off("room-messages");
    };
  }, [setMessages]);

  function getFormattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : "0" + month;
    let day = date.getDate().toString();
    day = day.length > 1 ? day : "0" + day;
    return month + "/" + day + "/" + year;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim() && !file) {
      alert("Message or file cannot be empty!");
      return;
    }

    const today = new Date();
    const minutes = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
    const time = today.getHours() + ":" + minutes;
    const roomId = currentRoom;

    // Prepare FormData to send to the backend
    const formData = new FormData();
    formData.append("message", message);
    if (file) formData.append("file", file); // Append the file if selected

    // Send the message and file to the backend
    fetch("https://lightningchat-backend.onrender.com/api/messages", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        socket.emit("sendMessage", data);  // Emit the message to the server via socket
      })
      .catch((error) => {
        console.error("Error sending message:", error);
      });

    setMessage("");  // Reset message input
    setFile(null);    // Reset file input
  }

  function scrollToBottom() {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const todayDate = getFormattedDate();

  // Handle file selection
  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  }

  return (
    <>
      <div className="messages-output">
        {user && !privateMemberMsg?._id && (
          <div className="alert alert-info">You are in the {currentRoom} Group</div>
        )}
        {user && privateMemberMsg?._id && (
          <div className="alert alert-info conversation-info">
            <div>
              You Chat with {privateMemberMsg.name}{" "}
              <img src={privateMemberMsg.picture} className="conversation-profile-pic" />
            </div>
          </div>
        )}
        {!user && <div className="alert alert-danger">Please Login</div>}

        {user &&
          messages.map(({ _id: date, messagesByDate }, idx) => (
            <div key={idx}>
              <p className="alert alert-info text-center message-date-indicator">{date}</p>
              {messagesByDate?.map(({ content, time, from: sender, fileUrl }, msgIdx) => (
                <div
                  className={sender?.email === user?.email ? "message" : "incoming-message"}
                  key={msgIdx}
                >
                  <div className="message-inner">
                    <div className="d-flex align-items-center mb-3">
                      <img
                        src={sender.picture}
                        style={{
                          width: 35,
                          height: 35,
                          objectFit: "cover",
                          borderRadius: "50%",
                          marginRight: 10,
                        }}
                      />
                      <p className="message-sender">{sender?._id === user?._id ? "You" : sender.name}</p>
                    </div>
                    <p className="message-content">{content}</p>
                    {fileUrl && (
                      <div className="message-file">
                        {/* Displaying image, video or document based on file type */}
                        {fileUrl.endsWith(".jpg") || fileUrl.endsWith(".png") || fileUrl.endsWith(".jpeg") ? (
                          <img src={fileUrl} alt="attachment" className="message-image" />
                        ) : fileUrl.endsWith(".mp4") || fileUrl.endsWith(".avi") ? (
                          <video controls className="message-video">
                            <source src={fileUrl} type="video/mp4" />
                          </video>
                        ) : (
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                            Download file
                          </a>
                        )}
                      </div>
                    )}
                    <p className="message-timestamp-left">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        <div ref={messageEndRef} />
      </div>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={10}>
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Your message"
                disabled={!user}
                value={message}
                required
                onChange={(e) => setMessage(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={1}>
            <Form.Control
              type="file"
              onChange={handleFileChange}
              disabled={!user}
              style={{ display: "none" }}
              id="file-upload"
            />
            <Button
              variant="secondary"
              onClick={() => document.getElementById("file-upload").click()}
              disabled={!user}
            >
              <FontAwesomeIcon icon={faPaperclip} className="attach-icon" />
            </Button>
          </Col>
          <Col md={1}>
            <Button
              variant="primary"
              type="submit"
              disabled={!user}
            >
              <FontAwesomeIcon icon={faPaperPlane} className="send-icon" />
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default MessageForm;
