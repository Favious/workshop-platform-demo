import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { colorsForPicker } from "./colorPickerColors";
import { useParams } from "react-router-dom";

import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";

export default function ColorPicker(props) {
  const [colors] = useState([...colorsForPicker]);
  const [selectedColor, setSelectedColor] = useState(["Negro", "#000000"]);
  const { order_id } = useParams();
  let docRef = undefined;
  useEffect(() => {
    if (order_id) {
      docRef = doc(db, "orders", order_id);
      const fetchData = async () => {
        let dataRetrieved = await getDoc(docRef);
        dataRetrieved = { ...dataRetrieved.data() };
        const colorPairRetrieved = colorsForPicker.find(
          (color) => color[0] === dataRetrieved.color
        );
        setSelectedColor(colorPairRetrieved);
        props.sendColor(colorPairRetrieved);
      };
      fetchData();
    }
  }, []);

  const handleChangeColor = (color) => {
    setSelectedColor(color);
    props.sendColor(color);
  };

  return (
    <StyledSection>
      {colors &&
        colors.map((color, index) => (
          <div
            key={index}
            className={`circle ${
              selectedColor != null && color[0] === selectedColor[0]
                ? "active"
                : ""
            }`}
            style={{
              background:
                selectedColor != null && color[0] === selectedColor[0]
                  ? "white"
                  : color[1],
              boxShadow: `inset 0 0 0 5px ${
                selectedColor != null && color[0] === selectedColor[0]
                  ? color[1] + ", 0 0 6px" + color[1]
                  : "transparent"
              }`,
            }}
            title={color[0]}
            onClick={() => handleChangeColor(color)}
          ></div>
        ))}
    </StyledSection>
  );
}

const StyledSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  .circle {
    border-radius: 50%;
    width: 35px;
    height: 35px;
    margin-bottom: 0.3rem;
    margin-left: 0.3rem;
  }

  .circle:hover {
    transform: scale(1.2);
  }

  .active {
    box-shadow: inset 0 0 0 3px red;
  }
`;
