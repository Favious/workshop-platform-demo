import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { BiX } from "react-icons/bi";
import { set, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { getDoc, doc } from "firebase/firestore";

const OrderSchema = yup.object().shape({
  name: yup
    .string()
    .matches(
      /^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ,./\-+%]+(?:[\s-][A-Za-z0-9ñÑáéíóúÁÉÍÓÚ,./\-+%]+)*$/,
      "Nombre invalido"
    ),
  price: yup.string().matches(/^[0-9]+?$/, "Numero invalido"),
});

export default function ElementsBox(props) {
  const [elementsList, setElementsList] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const { order_id } = useParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm({ resolver: yupResolver(OrderSchema) });

  let docRef = undefined;
  useEffect(() => {
    if (order_id) {
      docRef = doc(db, "orders", order_id);
      const fetchData = async () => {
        let dataRetrieved = await getDoc(docRef);
        dataRetrieved = { ...dataRetrieved.data() };
        let array = [];
        if (props.boxSelector === 1) {
          if (dataRetrieved.services) {
            array = Array.from(Object.values(dataRetrieved.services));
            let servicesTotalPrice = 0;
            array.map((elem) => (servicesTotalPrice += parseInt(elem[1])));
            setTotalPrice(servicesTotalPrice);
            setElementsList(array);
            props.sendBoxData(array);
          }
        } else {
          if (dataRetrieved.spares) {
            array = Array.from(Object.values(dataRetrieved.spares));
            let sparesTotalPrice = 0;
            array.map((elem) => (sparesTotalPrice += parseInt(elem[1])));
            setTotalPrice(sparesTotalPrice);
            setElementsList(array);
            props.sendBoxData(array);
          }
        }
      };
      fetchData();
    } else {
      setElementsList([]);
    }
  }, []);

  const onSubmit = () => {
    let formData = { ...getValues() };
    const localName = formData.name;
    const localPrice = formData.price;
    const copy = elementsList;
    copy.push([
      localName.charAt(0).toUpperCase() + localName.slice(1).toLowerCase(),
      localPrice,
    ]);
    setElementsList(copy);
    setTotalPrice(totalPrice + parseInt(localPrice));
    setValue("name", "");
    setValue("price", "");
    props.sendBoxData(elementsList);
  };

  const deleteElement = (id) => {
    const newElementsList = elementsList.filter((item, ind) => id !== ind);
    const element = elementsList.find((item, ind) => id === ind);
    setTotalPrice(totalPrice - parseInt(element[1]));
    setElementsList(newElementsList);
    props.sendBoxData(newElementsList);
  };

  return (
    <StyledBox style={{ backgroundColor: props.darkColor }}>
      <div className="title">
        <div>
          {props.name +
            (elementsList.length > 0 ? `: ${elementsList.length}` : "")}
        </div>
        {"Precio sumado: " + totalPrice + " Bs"}
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-box">
          <p className="label">
            Agregar un{" "}
            {props.name.slice(0, props.name.length - 1).toLowerCase()}
            ...
          </p>
          <div className={errors.name ? "name-errors" : ""}>
            {errors.name ? "Nombre invalido" : "Nombre:"}
          </div>
          <input
            className={errors.name ? "input-errors" : ""}
            type="text"
            autoComplete="off"
            {...register("name", { required: true, maxLength: 20 })}
            style={{ border: `1px solid ${props.darkColor}` }}
          />
          <div className={errors.price ? "name-errors" : ""}>
            {errors.price ? "Precio invalido" : "Precio:"}
          </div>
          <input
            className={errors.price ? "input-errors" : ""}
            type="number"
            autoComplete="off"
            {...register("price", { required: true, maxLength: 20 })}
            onKeyDown={(evt) =>
              (evt.key === "e" || evt.key === "-" || evt.key === ".") &&
              evt.preventDefault()
            }
            min="1"
            style={{ border: `1px solid ${props.darkColor}` }}
          />
          <button type="submit">+</button>
        </div>
      </form>
      {elementsList.length > 0 &&
        elementsList.map((el, index) => (
          <div
            className="list-box"
            key={index}
            style={{ backgroundColor: props.lightColor }}
          >
            <div className="number">{index + 1}</div>
            <div className="element">
              <div>{el[0]}</div>
              <div>{el[1]} Bs</div>
            </div>
            <button
              className="del-button"
              onClick={() => {
                deleteElement(index);
              }}
              type="button"
            >
              <BiX />
            </button>
          </div>
        ))}
    </StyledBox>
  );
}

const StyledBox = styled.div`
  display: flex;
  width: 100%;
  height: auto;
  border-radius: 0.6rem;
  flex-direction: column;
  border: none;
  padding-bottom: 0.5rem;
  .title {
    display: flex;
    justify-content: space-around;
    width: 100%;
    color: white;
    font-size: 1.8rem;
    text-align: start;
    margin-left: 1rem;
    padding: 1rem;
  }
  .input-box {
    border-radius: inherit;
    display: flex;
    align-items: center;
    background-color: white;
    border-radius: 0.6rem;
    padding: 1rem;
    width: 95%;
    height: auto;
    margin: auto;
    font-size: 1.2rem;
    justify-content: space-evenly;
    input {
      height: 2rem;
      padding: 0.5rem;
      border-radius: 0.6rem;
      -moz-appearance: textfield;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    button {
      align-items: center;
      background-color: var(--appleSilver);
      color: white;
      border: none;
      font-size: 2rem;
      width: 75px;
      padding: 0 1rem 0.4rem 1rem;
      border-radius: 0.6rem;
      cursor: pointer;
    }
  }

  .list-box {
    margin-top: 0.5rem !important;
    border-radius: inherit;
    display: flex;
    align-items: center;
    color: var(--purple);
    padding: 1rem;
    width: 95%;
    height: 4rem;
    margin: auto;
    font-size: 1.6rem;
    /* justify-content: space-around; */
    .number {
      margin: 0 1rem 0 1rem;
      background-color: var(--appleSilver);
      border-radius: 50% !important;
      color: white !important;
      padding: 0.3rem 0.8rem !important;
    }
    .element {
      font-size: 1.4rem;
      display: flex;
      justify-content: space-around;
      width: 100% !important;
      align-items: center;
      div:first-child {
        width: 70% !important;
      }
      div:last-child {
        margin-right: 1rem;
      }
    }
    .del-button {
      display: flex;
      align-items: center;
      border-radius: 50%;
      background-color: #da0037;
      color: white;
      font-style: bold !important;
      font-size: 2.6rem !important;
      border: 0;
      cursor: pointer;
    }
  }
  .name-errors {
    color: red !important;
    font-weight: 900;
  }
  .input-errors {
    background-color: #fbe3e9;
    color: red !important;
  }

  @media screen and (min-width: 280px) and (max-width: 1080px) {
    .title {
      font-size: 1.5rem;
      margin-left: 0;
      display: flex;
      flex-direction: column;
      justify-content: start !important;
    }

    form {
      display: flex;
      justify-content: center;
      .input-box {
        margin: auto;
        display: inline-block;
        text-align: center;
        div {
          display: flex !important;
        }
        input {
          margin: 0 auto;
          display: flex !important;
          width: 100% !important;
          margin-top: 0.5rem;
          font-size: 16px !important;
        }
        p {
          display: none;
        }
        button {
          width: 30%;
          margin-top: 1rem;
        }
      }
    }

    .list-box {
      padding: 0.5rem;
      .number {
        padding: 0.3rem 0.8rem 0.3rem 0.8rem !important;
        margin: 0 !important;
      }
      .element {
        font-size: 1.2rem;
        div:first-child {
          width: 50% !important;
        }
        div:last-child {
          width: 30% !important;
          margin-right: 0 !important;
        }
      }
      .del-button {
        padding: 0.2rem;
        font-size: 2rem !important;
        align-items: center !important;
        svg {
          margin: 0 !important;
        }
      }
    }
  }
`;
