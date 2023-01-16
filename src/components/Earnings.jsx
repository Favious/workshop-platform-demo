import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from "recharts";
import { cardStyles } from "./ReusableStyles";

export default function Earnings() {
  const [data, setData] = useState([]);
  const [growth, setGrowth] = useState(0);
  const [lastMonthSales, setLastMonthSales] = useState(0);
  const monthsTranslation = {
    January: "Enero",
    February: "Febrero",
    March: "Marzo",
    April: "Abril",
    May: "Mayo",
    June: "Junio",
    July: "Julio",
    August: "Agosto",
    September: "Septiembre",
    October: "Octubre",
    November: "Noviembre",
    December: "Diciembre",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://us-central1-jumsite-a9a31.cloudfunctions.net/getTotalPricesByMonth"
        );
        let json = await response.json();
        json = json.map((ob) => ({
          Mes: monthsTranslation[ob.month],
          Ventas: ob.totalPrice,
        }));
        setData(json);
        setGrowth(getGrowth(json));
        setLastMonthSales(json[json.length - 1].Ventas);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  function getGrowth(dat) {
    // Get the total price for the last two months
    const lastMonthPrice = dat[dat.length - 1].totalPrice;
    const secondToLastMonthPrice = dat[dat.length - 2].totalPrice;

    // Calculate the percentage of growth
    let growth = 0;
    if (secondToLastMonthPrice > 0) {
      growth =
        ((lastMonthPrice - secondToLastMonthPrice) / secondToLastMonthPrice) *
        100;
    }
    return growth;
  }

  return (
    <Section>
      <div className="top">
        <div className="info">
          <h5>Ganancias del mes</h5>
          <h1>{lastMonthSales} Bs</h1>
          <div className="growth">
            <span>{growth > -1 ? `+${growth}%` : `${growth}%`}</span>
          </div>
        </div>
      </div>
      <div className="chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            width={500}
            height={400}
            data={data}
            margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <Tooltip cursor={false} />
            <XAxis dataKey="Mes" />
            <Area
              animationBegin={800}
              animationDuration={2000}
              type="monotone"
              dataKey="Ventas"
              stroke="#246ace"
              fill="#b7d0f4"
              strokeWidth={4}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}
const Section = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 20rem;
  ${cardStyles}
  padding: 2rem 0 0 0;
  .top {
    .info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
      h1 {
        font-size: 2rem;
      }
      .growth {
        background-color: #b7d0f4;
        padding: 0.5rem;
        border-radius: 1rem;
        transition: 0.3s ease-in-out;
        &:hover {
          background-color: var(--blue);
          span {
            color: #b7d0f4;
          }
        }
        span {
          color: var(--blue);
        }
      }
    }
  }
  .chart {
    height: 70%;
    .recharts-default-tooltip {
      background-color: black !important;
      border-color: black !important;
    }
  }
  @media screen and (min-width: 280px) and (max-width: 1080px) {
  }
`;
