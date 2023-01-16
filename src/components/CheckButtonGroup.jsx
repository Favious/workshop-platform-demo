import React, { useState, useEffect } from "react";
import styled from "styled-components";
import CheckButton from "../components/CheckButton";

import { useParams } from "react-router-dom";

import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";

export default function CheckButtonGroup(props) {
  const [extraParts, setExtraParts] = useState([]);
  const [inputPart, setInputPart] = useState("");
  const { order_id } = useParams();

  let docRef = undefined;
  useEffect(() => {
    if (order_id) {
      docRef = doc(db, "orders", order_id);
      const fetchData = async () => {
        let dataRetrieved = await getDoc(docRef);
        dataRetrieved = { ...dataRetrieved.data() };
        const partsRetrieved = Array.from(
          Object.values(dataRetrieved.partsDetail)
        );
        setExtraParts(partsRetrieved);
        props.sendParts(partsRetrieved);
      };
      fetchData();
    } else {
      const defaultParts = [
        ["Llantas de auxilio", false],
        ["Gata", false],
        ["Llave cruz", false],
        ["Limpia parabrisas", false],
        ["Pisos", false],
        ["Tapa de tanque", false],
        ["Antena", false],
        ["Retrovisores", false],
      ];
      setExtraParts(defaultParts);
      props.sendParts(defaultParts);
    }
  }, []);

  const handleChangeInput = (event) => {
    setInputPart(event.target.value);
  };

  const addExtraPart = () => {
    let formattedPart;
    if (inputPart) {
      formattedPart =
        inputPart.charAt(0).toUpperCase() + inputPart.slice(1).toLowerCase();
      const copy = extraParts;
      copy.push([formattedPart, false]);
      setExtraParts(copy);
    }
    setInputPart("");
    props.sendParts(extraParts);
  };

  const getPartPair = (partPair) => {
    const pairChangedIndex = extraParts.findIndex(
      (part) => partPair[0] === part[0]
    );
    const copy = extraParts;
    partPair[1] = !partPair[1];
    copy[pairChangedIndex] = partPair;
    setExtraParts(copy);
    props.sendParts(extraParts);
  };

  return (
    <StyledGrid>
      {extraParts.map((part, index) => (
        <CheckButton
          key={index}
          name={part[0]}
          selection={part[1]}
          sendPartPair={getPartPair}
        />
      ))}
      <div className="add-input">
        <input
          type="text"
          placeholder="Agregar"
          value={inputPart}
          onChange={handleChangeInput}
        />
        <button className="add-button" type="button" onClick={addExtraPart}>
          +
        </button>
      </div>
    </StyledGrid>
  );
}

const StyledGrid = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: auto auto auto auto;
  .add-input {
    border-radius: 1rem;
    border: none;
    display: flex;
    margin: 10px;
    justify-content: space-between;
    font-size: 1.3rem;
    background-color: var(--white);
    border: 2px dashed var(--blue);
    input {
      width: auto;
      border-radius: 1rem 0 0 1rem;
      border: none !important;
      margin-left: 12px !important;
      background-color: var(--white);
      &::placeholder {
        color: var(--purple) !important;
      }
    }
    button {
      width: 75px;
      border-radius: 0 0.6rem 0.6rem 0;
      border: none;
      font-size: 2rem;
      color: white;
      background-color: var(--blue);
      &:hover {
        cursor: pointer;
      }
    }
  }
  @media screen and (min-width: 280px) and (max-width: 680px) {
    grid-template-columns: auto;
  }
  @media screen and (min-width: 680px) and (max-width: 1080px) {
    grid-template-columns: auto auto;
  }
`;
