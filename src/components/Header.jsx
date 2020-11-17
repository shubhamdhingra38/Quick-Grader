import React, { useEffect, useState } from "react";
import "./Header.css";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import axios from "axios";

function Header(props) {
  const [type, setType] = useState();

  useEffect(() => {
    axios
      .get("http://localhost:8000/auth/user/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${props.token}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        setType(res.data.group);
      })
      .catch((err) => console.log(err.response));
  }, [props.token]);

  let authElement = !props.token ? (
    <>
      <Nav.Link className="mx-3" href="/login">
        Login
      </Nav.Link>
      <Nav.Link className="mx-3" href="/register">
        Register
      </Nav.Link>
    </>
  ) : (
    <Nav.Link
      className="mx-3"
      onClick={() => {
        localStorage.removeItem("token");
      }}
      href="/"
    >
      Logout
    </Nav.Link>
  );

  return (
    <>
      <Navbar
      fixed="top"
        collapseOnSelect
        expand="lg"
        variant="dark"
        style={{
          backgroundColor: "rgba(30, 30, 30, 0.95)",
        }}
      >
        <Navbar.Brand href="#">
          <img
            style={{ height: "45px" }}
            className="content-image mx-3"
            src={require("./static/images/logo.png")}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link className="mx-2" href="/">
              Home
            </Nav.Link>
            <Nav.Link className="mx-2" href="/about">
              About
            </Nav.Link>
            {type == "Faculty" && (
              <Nav.Link className="mx-2" href="/dashboard">
                Dashboard
              </Nav.Link>
            )}
          </Nav>
          <Nav>{authElement}</Nav>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
}

export default Header;
