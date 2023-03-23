import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { MdSpaceDashboard } from "react-icons/md";
import { BiCalendar } from "react-icons/bi";
import { BsWrench } from "react-icons/bs";
import { FiLogOut } from "react-icons/fi";
import { GiHamburgerMenu } from "react-icons/gi";
import { VscChromeClose } from "react-icons/vsc";
import scrollreveal from "scrollreveal";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, NavLink } from "react-router-dom";
import useOnClickOuside from "../hooks/useOnClickOutside";

export default function Sidebar() {
  const [navbarState, setNavbarState] = useState(false);
  const navigate = useNavigate();
  const { logout, isSignedIn } = useAuth();
  const ref = useRef();
  async function handleSignOut(e) {
    e.preventDefault();
    closeMenu();

    try {
      await logout();
      navigate("/login");
    } catch {}
  }

  useEffect(() => {
    const sr = scrollreveal({
      origin: "left",
      distance: "80px",
      duration: 1000,
      reset: false,
    });

    sr.reveal(
      `
          .brand,
          .links>ul:nth-of-type(1),
          .links>ul>NavLink:nth-of-type(2),
          .links>ul>NavLink:nth-of-type(3),
          .logout
      `,
      {
        opacity: 0,
        interval: 300,
      }
    );
  }, []);

  const activeStyle = {
    textDecoration: "none",
    borderRadius: "0.6rem",
    li: {
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      a: {
        color: "white",
      },
    },
  };

  const openMenu = (e) => {
    document.body.style.overflow = "hidden";
    e.stopPropagation();
    setNavbarState(true);
  };

  const closeMenu = () => {
    document.body.style.overflow = "";
    setNavbarState(false);
  };

  useOnClickOuside(ref, closeMenu);

  return (
    <>
      <Section>
        <div className="top">
          <div className="brand">
            <span>
              <img src="https://i.imgur.com/bhkfaAn.png" />
            </span>
          </div>
          <div className="toggle">
            {navbarState ? (
              <VscChromeClose onClick={closeMenu} />
            ) : (
              <GiHamburgerMenu
                onClick={(e) => {
                  openMenu(e);
                }}
              />
            )}
          </div>
          <div className="links">
            <ul>
              <NavLink
                to="/"
                style={({ isActive }) =>
                  isActive ? activeStyle : { textDecoration: "none" }
                }
              >
                <li>
                  <div className="a">
                    <MdSpaceDashboard />
                    <span> Dashboard</span>
                  </div>
                </li>
              </NavLink>
              <NavLink
                to="/create_order"
                style={({ isActive }) =>
                  isActive ? activeStyle : { textDecoration: "none" }
                }
              >
                <li>
                  <div className="a">
                    <BsWrench />
                    <span> Crear orden</span>
                  </div>
                </li>
              </NavLink>
              <NavLink
                to="/orders"
                style={({ isActive }) =>
                  isActive ? activeStyle : { textDecoration: "none" }
                }
              >
                <li>
                  <div className="a">
                    <BiCalendar />
                    <span> Ordenes</span>
                  </div>
                </li>
              </NavLink>
            </ul>
          </div>
        </div>
        <div className="logout">
          <a onClick={handleSignOut} href="#/">
            <FiLogOut />
            <span className="logout">Cerrar sesión</span>
          </a>
        </div>
      </Section>
      <ResponsiveNav
        state={navbarState}
        className={navbarState ? "show" : ""}
        ref={ref}
      >
        <div className="responsive__links">
          <ul>
            <NavLink
              to="/"
              style={({ isActive }) =>
                isActive ? activeStyle : { textDecoration: "none" }
              }
            >
              <li>
                <div className="a">
                  <MdSpaceDashboard />
                  <span> Dashboard</span>
                </div>
              </li>
            </NavLink>
            <NavLink
              to="/create_order"
              style={({ isActive }) =>
                isActive ? activeStyle : { textDecoration: "none" }
              }
            >
              <li>
                <div className="a">
                  <BsWrench />
                  <span> Crear orden</span>
                </div>
              </li>
            </NavLink>
            <NavLink
              to="/orders"
              style={({ isActive }) =>
                isActive ? activeStyle : { textDecoration: "none" }
              }
            >
              <li>
                <div className="a">
                  <BiCalendar />
                  <span> Ordenes</span>
                </div>
              </li>
            </NavLink>
          </ul>
          <div className="logout-side">
            <a onClick={handleSignOut} href="#/">
              <FiLogOut />
              <span> Cerrar sesión</span>
            </a>
          </div>
        </div>
      </ResponsiveNav>
    </>
  );
}
const Section = styled.section`
  position: fixed;

  left: 0;
  background-color: var(--appleSilver);
  height: 100vh;
  width: 18vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 0;
  gap: 2rem;
  .top {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;

    .toggle {
      display: none;
    }
    .brand {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      svg {
        color: var(--appleLightSilver);
        font-size: 2rem;
      }
      span {
        font-size: 2.5rem;
        color: white;
        font-family: "Open Sans", sans-serif;
        font-weight: bold;
        font-style: italic;
        img {
          width: 250px;
          height: 75px;
        }
      }
    }
    .links {
      display: flex;
      justify-content: center;
      font-size: 1.4rem;
      ul {
        list-style-type: none;
        display: flex;
        width: 90%;
        flex-direction: column;
        gap: 1rem;
        li {
          padding: 0.6rem 1rem;
          border-radius: 0.6rem;
          &:hover {
            width: 100%;
            background-color: rgba(255, 255, 255, 0.5);
            .a {
            }
          }
          .a {
            text-decoration: none;
            display: flex;
            gap: 1rem;
            color: var(--appleLightSilver);
          }
        }
        .active {
          background-color: rgba(255, 255, 255, 0.5);
          .a {
            color: white;
          }
        }
      }
    }
  }

  .logout {
    padding: 0.3rem 1rem;
    border-radius: 0.6rem;
    &:hover {
      background-color: #da0037;
      cursor: pointer;
    }
    a {
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      color: white;
    }
  }
  @media screen and (min-width: 280px) and (max-width: 1080px) {
    position: initial;
    width: 100%;
    height: max-content;
    padding: 1rem;
    .top {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      .toggle {
        display: block;
        color: white;
        z-index: 99;
        svg {
          font-size: 1.4rem;
        }
      }
      .brand {
        gap: 1rem;
        justify-content: flex-start;
        span {
          display: flex;
          align-items: center;
          img {
            width: 200px;
            height: 50px;
          }
        }
      }
    }
    .top > .links,
    .logout {
      display: none;
    }
  }
`;

const ResponsiveNav = styled.div`
  position: fixed;
  right: -10vw;
  top: 0;
  z-index: 10;
  background-color: var(--appleSilver);
  height: auto;
  width: ${({ state }) => (state ? "50%" : "0%")};
  transition: 0.4s ease-in-out;
  display: flex;
  opacity: 0;
  visibility: hidden;
  padding: 0.7rem;
  .responsive__links {
    width: 100%;
    font-size: 1.5rem;

    ul {
      list-style-type: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 3rem;
      svg {
        font-size: 1.8rem;
      }
      li {
        padding: 0.6rem 1rem;
        border-radius: 0.6rem;

        &:hover {
          background-color: rgba(255, 255, 255, 0.5);
          .a {
          }
        }
        .a {
          text-decoration: none;
          gap: 1rem;
          color: white;
        }
      }
      .active {
        background-color: rgba(255, 255, 255, 0.5);
        .a {
          color: white;
        }
      }
    }
  }
  .logout-side {
    padding-top: 0.8rem;
    border-radius: 0.6rem;
    margin-top: 3vh;
    width: 75%;
    height: 50px;
    font-size: 1.2rem;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 3vh;

    background-color: #da0037;
    cursor: pointer;

    a {
      text-decoration: none;
      display: block;
      align-items: center;
      justify-content: center;
      color: white;
      padding: 0;
    }
  }
  @media screen and (min-width: 280px) and (max-width: 680px) {
    .responsive__links {
      font-size: 1.3rem;
      ul {
        svg {
          font-size: 1.2rem !important;
        }
      }
    }
    .logout-side {
      font-size: 1rem;
      padding-top: 0.5rem;
      width: 80%;
      height: 40px;
    }
  }
`;
