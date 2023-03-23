import React from "react";
import styled from "styled-components";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { cardStyles } from "./ReusableStyles";
export default function Profile(props) {
  return (
    <Section>
      <div className="image">
        <img src={"https://imgur.com/E2Q0b2g.png"} alt="" />
      </div>
      <div className="title">
        <h2>Admintask Pro</h2>
        <h5>
          <HiOutlineLocationMarker /> Cbba, Bolivia
        </h5>
      </div>
      <div className="info">
        <div className="container">
          <h5>Dias en el trabajo</h5>
          <h3>
            {(() => {
              const januaryFirst = new Date(2023, 0, 1);
              const currentDate = new Date();
              const differenceInMilliseconds = currentDate - januaryFirst;
              return Math.floor(
                differenceInMilliseconds / (1000 * 60 * 60 * 24)
              );
            })()}
          </h3>
        </div>
        <div className="container">
          <h5>Ordenes registradas</h5>
          <h3>{props.totalOrdersFromThisYear}</h3>
        </div>
      </div>
    </Section>
  );
}
const Section = styled.section`
  ${cardStyles};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  .image {
    max-height: 10rem;
    overflow: hidden;
    border-radius: 20rem;
    border: 2px solid var(--blue);
    img {
      height: 10rem;
      width: 10rem;
      object-fit: contain;
      border-radius: 20rem;
      transition: 0.5s ease-in-out;
    }
    &:hover {
      img {
        transform: scale(1.1);
      }
    }
  }
  .title {
    text-align: center;
    h2,
    h5 {
      color: var(--blue);
      font-family: "Permanent Marker", cursive;
      letter-spacing: 0.3rem;
    }
    h5 {
      letter-spacing: 0.2rem;
    }
  }
  .info {
    display: flex;
    gap: 1rem;
    .container {
      text-align: center;
    }
  }
`;
