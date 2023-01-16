import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { HiArrowNarrowRight } from "react-icons/hi";
import { cardStyles } from "./ReusableStyles";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "@firebase/firestore";

export default function Transfers() {
  const [orders, setOrders] = useState([]);
  const ordersCollectionRef = collection(db, "orders");
  const navigate = useNavigate();

  const imagesList = [
    "https://i.imgur.com/pNCzjmu.png",
    "https://i.imgur.com/CMXEUSh.png",
    "https://e7.pngegg.com/pngimages/167/795/png-clipart-green-and-white-check-icon-check-mark-checkbox-computer-icons-checklist-miscellaneous-angle.png",
  ];

  useEffect(() => {
    const fetchData = async () => {
      const dataRetrieved = await getDocs(
        query(ordersCollectionRef, orderBy("time", "desc"), limit(3))
      );
      setOrders(
        dataRetrieved.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    };
    fetchData();
  }, []);

  const convertDate = (el) => {
    let newDate = new Date(el.seconds * 1000);
    const dateArray = newDate.toString().split(" ");
    const mapDateTranslation = {
      Jan: "Ene",
      Feb: "Feb",
      Mar: "Mar",
      Apr: "Abr",
      May: "May",
      Jun: "Jun",
      Jul: "Jul",
      Aug: "Ago",
      Sep: "Sep",
      Oct: "Oct",
      Nov: "Novs",
      Dec: "Dic",
    };
    return (
      mapDateTranslation[dateArray[1]] +
      " " +
      dateArray[2] +
      ", " +
      dateArray[3]
    );
  };

  return (
    <Section>
      <div className="title">
        <h2>Ultimas ordenes</h2>
      </div>
      <div className="transactions">
        {orders.map((order, index) => (
          <div className="transaction" key={index}>
            <div className="transaction__title">
              <div className="transaction__title__image">
                <img src={imagesList[order.status]} alt="" />
              </div>
              <div className="transaction__title__details">
                <h3>{order.owner + " - " + order.brand + " " + order.model}</h3>
                <h5>{convertDate(order.billDate)}</h5>
              </div>
            </div>
            <div className="transaction__amount">
              <span>+{order.totalPrice}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="view" onClick={() => navigate("/orders")}>
        Ver todas <HiArrowNarrowRight />
      </div>
    </Section>
  );
}

const Section = styled.section`
  ${cardStyles};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  .title {
    h2 {
      color: var(--blue);
      font-family: "Permanent Marker", cursive;
      letter-spacing: 0.3rem;
    }
  }
  .transactions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
    .transaction {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      &__title {
        display: flex;
        gap: 1rem;
        &__image {
          img {
            height: 3.5rem;
            border-radius: 3rem;
          }
        }
        &__details {
          padding-top: 0.5rem;
        }
      }
      &__amount {
        background-color: #b7d0f4;
        padding: 0.2rem 0.5rem;
        width: 4rem;
        border-radius: 1rem;
        text-align: center;
        transition: 0.3s ease-in-out;
        &:hover {
          background-color: var(--blue);
          span {
            color: white;
          }
        }
        span {
          color: var(--blue);
        }
      }
    }
  }
  .view {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    text-decoration: none;
    color: var(--blue);
    font-weight: bold;
    margin-top: 1rem;
    cursor: pointer;
    gap: 0.5rem;
    svg {
      transition: 0.3s ease-in-out;
      font-size: 1.4rem;
    }
    &:hover {
      svg {
        transform: translateX(0.5rem);
      }
    }
  }
  @media screen and (min-width: 280px) and (max-width: 375px) {
    .transactions {
      .transaction {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
    }
  }
`;
