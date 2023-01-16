import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ElementsBox from "../components/ElementsBox";
import { cardStyles } from "../components/ReusableStyles";
import { BeatLoader } from "react-spinners";

import { db } from "../firebase";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

export default function ServicesSparesPage() {
  const [services, setServices] = useState([]);
  const [spares, setSpares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState({});
  const navigate = useNavigate();
  const { order_id } = useParams();
  let docRef = doc(db, "orders", order_id);

  useEffect(() => {
    const getOrderInfo = async () => {
      let data = await getDoc(docRef);
      setOrderInfo({ ...data.data() });
    };
    getOrderInfo();
  });

  const getServicesData = (data) => {
    setServices(data);
  };

  const getSparesData = (data) => {
    setSpares(data);
  };

  const submitBoxes = async () => {
    if (order_id) {
      setLoading(true);
      let totalPriceCopy = 0;
      services.map((ser) => (totalPriceCopy += parseInt(ser[1])));
      spares.map((spa) => (totalPriceCopy += parseInt(spa[1])));

      let data = await getDoc(docRef);
      const statusRetrieved = data.data().status;

      await updateDoc(docRef, {
        ...data.data(),
        services: { ...services },
        spares: { ...spares },
        time: new Date(),
        totalPrice: parseInt(totalPriceCopy),
        status: statusRetrieved < 2 ? (totalPriceCopy > 0 ? 1 : 0) : 2,
      });
      setLoading(false);
      navigate("../orders");
    }
  };

  return (
    <Section>
      <div className="faqs">
        <div className="row">
          <div className="main-title">
            <h2>Servicios y repuestos</h2>
          </div>
        </div>
        <div className="row">
          <h1>
            Orden:{" "}
            <span>
              {(orderInfo.brand ? orderInfo.brand + " " : "Cargando...") +
                (orderInfo.model ? orderInfo.model + " " : "") +
                (orderInfo.year ? orderInfo.year + " - " : "") +
                (orderInfo.owner ? orderInfo.owner : "")}
            </span>
          </h1>
        </div>
        <div className="row">
          <ElementsBox
            name="Servicios"
            darkColor="#f16d01"
            lightColor="#f3d2a7"
            sendBoxData={getServicesData}
            boxSelector={1}
          />
        </div>
        <div className="row">
          <ElementsBox
            name="Repuestos"
            darkColor="#753aba"
            lightColor="#e1bdff"
            sendBoxData={getSparesData}
            boxSelector={0}
          />
        </div>
        <div className="row">
          <div className="submit-button" disabled={loading}>
            <button type="submit" onClick={() => submitBoxes()}>
              {loading ? <BeatLoader color="#ffffff" /> : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
}

const Section = styled.section`
  width: 100%;
  flex-direction: column;
  display: flex;
  ${cardStyles}

  .main-title {
    display: flex;
    margin-bottom: 1rem;
    h2 {
      color: var(--blue);
      padding-left: 3rem;
      font-size: 2.5rem;
      width: 100%;
    }

    font-size: 2rem;
    letter-spacing: 0.3rem;
  }

  .title {
    h2 {
      color: var(--blue);
      letter-spacing: 0.3rem;
      font-size: 1.6rem;
    }
  }

  .date-title {
    padding-right: 1rem;

    h2 {
      color: var(--purple);
      letter-spacing: 0.3rem;
      font-size: 1.4rem;
    }
  }

  .faqs {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
    font-size: 1rem;

    .faq {
      display: flex;
      justify-content: space-between;
      cursor: pointer;

      .info {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      svg {
        font-size: 1.4rem;
      }

      &:nth-of-type(2) {
        border-top: 0.01rem solid #6c6e6e;
        border-bottom: 0.01rem solid #6c6e6e;
        padding: 0.8rem 0;
      }
    }
  }

  .label {
    display: flex;
    padding-right: 1rem;
    font-size: 1.4rem;
    span {
      margin-left: 6px;
      margin-right: 6px;
      font-size: 1.7rem;
    }
  }

  .row,
  .row-top {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    h1 {
      font-size: 1.5rem;
      span {
        color: var(--appleSilver);
        font-size: 1.3rem;
        font-style: normal !important;
        font-weight: normal !important;
        letter-spacing: 2px;
      }
    }
  }

  .row-input {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 50%;
    min-height: 40px;

    textarea {
      min-width: 85%;
      max-width: 85%;
      min-height: 8rem;
      padding: 0.5rem;
      font-size: 1.3rem;
      border-color: var(--blue);
      margin-top: 1rem;
      border-radius: 1rem;
    }
    p {
      color: red;
      font-size: 1.4rem;
    }
  }

  input[type="text"].input-errors,
  input[type="number"].input-errors,
  select.input-errors {
    border-bottom: 2px solid red;
  }

  .input-whole {
    width: 80%;
  }

  .errors-message {
    position: relative;
    margin-top: 0.7rem;
    display: flex;
    justify-content: center;
  }

  .small {
    width: 25%;
  }

  .submit-button {
    display: flex;
    width: 100%;
    margin-top: 2rem;
    justify-content: center;

    button[type="submit"] {
      background-color: rgb(9, 125, 33);
      color: white;
      width: 40%;
      padding: 1rem;
      border-radius: 1rem;
      border: none;
      font-size: 1.5rem;
    }

    button[type="submit"]:hover {
      background-color: #086725;
    }
  }

  @media screen and (min-width: 280px) and (max-width: 1080px) {
    .main-title {
      text-align: center;
      h2 {
        padding-left: 0 !important;
      }
    }

    .submit-button {
      button[type="submit"] {
        width: 100%;
      }
    }
  }
`;
