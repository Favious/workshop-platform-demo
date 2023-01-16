import React, { useState } from "react";
import styled from "styled-components";
import { BsCircleFill, BsCheckCircleFill } from "react-icons/bs";

export default function CheckButton(props) {
  const [isSelected, setIsSelected] = useState(props.selection);

  const handleClick = () => {
    setIsSelected(!isSelected);
    props.sendPartPair([props.name, isSelected]);
  };

  return (
    <StyledButton
      type="button"
      onClick={() => handleClick()}
      isSelected={isSelected}
    >
      {props.name}
      {!isSelected ? (
        <BsCircleFill className="circle" />
      ) : (
        <BsCheckCircleFill className="circle" />
      )}
    </StyledButton>
  );
}

const StyledButton = styled.button`
  display: flex;
  border-radius: 1rem;
  background-color: ${(props) =>
    !props.isSelected ? "var(--appleLightSilver)" : "var(--blue)"};
  color: ${(props) => (!props.isSelected ? "var(--purple)" : "var(--white)")};
  border: none;
  justify-content: space-between;
  padding: 12px;
  margin: 10px;
  font-size: 1.3rem;
  text-align: center;
  .circle {
    font-size: 1.5rem;
    color: white;
  }
  :hover {
    background-color: ${(props) => (!props.isSelected ? "#bac2d1" : "#1d59ad")};
  }
`;
