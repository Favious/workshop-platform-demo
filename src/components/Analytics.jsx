import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { BsFillCalendar2WeekFill } from "react-icons/bs";
import { IoStatsChart } from "react-icons/io5";
import { BiGroup } from "react-icons/bi";
import { FiActivity } from "react-icons/fi";
import { cardStyles } from "./ReusableStyles";
export default function Analytics(props) {
  const [activeOrders, setActiveOrders] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [newMonthClients, setNewMonthClients] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const activeOrdersResponse = await fetch(
        "https://us-central1-workshop-platform-demo.cloudfunctions.net/countOrdersWithStatus1"
      );
      setActiveOrders(await activeOrdersResponse.json());
      const monthSalesResponse = await fetch(
        "https://us-central1-workshop-platform-demo.cloudfunctions.net/getTotalPriceForCurrentMonth"
      );
      setMonthSales(await monthSalesResponse.json());
      const newMonthClientsResponse = await fetch(
        "https://us-central1-workshop-platform-demo.cloudfunctions.net/countNewClientsForCurrentMonth"
      );
      setNewMonthClients(await newMonthClientsResponse.json());
    };
    fetchData();
  }, []);

  return (
    <Section>
      <div className="analytic ">
        <div className="content">
          <h5>Ordenes activas</h5>
          <h2>{activeOrders}</h2>
        </div>
        <div className="logo">
          <BsFillCalendar2WeekFill />
        </div>
      </div>
      <div className="analytic">
        <div className="logo">
          <IoStatsChart />
        </div>
        <div className="content">
          <h5>Ventas del mes</h5>
          <h2>{monthSales} Bs</h2>
        </div>
      </div>
      <div className="analytic">
        <div className="logo">
          <BiGroup />
        </div>
        <div className="content">
          <h5>Clientes nuevos del mes</h5>
          <h2>{newMonthClients}</h2>
        </div>
      </div>
      <div className="analytic ">
        <div className="content">
          <h5>Ordenes registradas</h5>
          <h2>{props.totalOrdersFromThisYear}</h2>
        </div>
        <div className="logo">
          <FiActivity />
        </div>
      </div>
    </Section>
  );
}
const Section = styled.section`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  font-size: 1.2rem;
  .analytic {
    ${cardStyles};
    padding: 1rem;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    gap: 1rem;
    transition: 0.5s ease-in-out;
    &:hover {
      background-color: var(--blue);
      color: white;
      svg {
        color: white;
      }
    }
    .logo {
      background-color: var(--blue);
      border-radius: 3rem;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 1.5rem;
      svg {
        font-size: 1.5rem;
      }
    }
  }

  @media screen and (min-width: 280px) and (max-width: 720px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    .analytic {
      &:nth-of-type(3),
      &:nth-of-type(4) {
        flex-direction: row-reverse;
      }
    }
  }
`;
