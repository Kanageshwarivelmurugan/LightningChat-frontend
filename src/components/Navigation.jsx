import React from 'react';
import { Nav, Navbar, Container, Button, NavDropdown } from "react-bootstrap";
import { useLogoutUserMutation } from "../services/appApi";
import { LinkContainer } from "react-router-bootstrap";
import logo from "../assets/logo.png";
import { useSelector } from "react-redux";


function Navigation() {
  const user = useSelector((state) => state.user);
  const [logoutUser] = useLogoutUserMutation();
    async function handleLogout(e) {
        e.preventDefault();
        await logoutUser(user);
        window.location.replace("/");
    }

  return (
    
   
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <LinkContainer to ="/">

        <img src={logo} style={{ width: 500, height: 100 }} />
        

        </LinkContainer>
        <h1>LightningChat</h1>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
          {!user && (
            <LinkContainer to="/login">
            <Nav.Link >Login</Nav.Link>
            </LinkContainer>
            )}
            <LinkContainer to="/chat">
            <Nav.Link >Chat</Nav.Link>
            </LinkContainer>
            {user && (
            <NavDropdown title={
              <>
                  <img src={user.picture} style={{ width: 30, height: 30, marginRight: 10, objectFit: "cover", borderRadius: "50%" }} />
                  {user.name}
              </>
          }
            id="basic-nav-dropdown">
               <NavDropdown.Item>
              
                <Button variant="danger" onClick={handleLogout}>
                  Logout
                </Button>
              </NavDropdown.Item>
            </NavDropdown>
            )}
             
          </Nav>
           
        </Navbar.Collapse>
      </Container>
    </Navbar>
 

    
  )
}
export default Navigation
