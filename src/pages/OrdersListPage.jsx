import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { BiLeftArrowAlt, BiSearch } from "react-icons/bi";
import { cardStyles } from "../components/ReusableStyles";
import { useNavigate } from "react-router-dom";
import {
  BiWrench,
  BiEdit,
  BiFile,
  BiCheckCircle,
  BiListOl,
  BiFilterAlt,
  BiTrash,
  BiPrinter,
  BiRightArrowAlt,
  BiTaskX,
} from "react-icons/bi";
import useOnClickOuside from "../hooks/useOnClickOutside";
import tingle from "tingle.js";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  limit,
  deleteDoc,
  getCountFromServer,
  startAfter,
  startAt,
  endAt,
} from "@firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { ClockLoader } from "react-spinners";
import { findColorInArray } from "../components/colorPickerColors";

export default function OrdersListPage() {
  const ORDERS_LIMIT = 5;
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(-1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState({
    filter: "brand",
    translation: "Marca",
  });
  const [numberOfPages, setNumberOfPages] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [lastDocumentVisible, setLastDocumentVisible] = useState({});
  const [queryStack, setQueryStack] = useState([{}]);
  const [searchInput, setSearchInput] = useState("");
  const [searchInputTag, setSearchInputTag] = useState("");
  const ordersCollectionRef = collection(db, "orders");
  const [ordersQuery, setOrdersQuery] = useState(0);
  const sortRef = useRef();
  const optionsRef = useRef({});
  const navigate = useNavigate();
  const searchFilters = [
    {
      filter: "brand",
      translation: "Marca",
    },
    {
      filter: "ciNit",
      translation: "CI/NIT",
    },
    {
      filter: "color",
      translation: "Color",
    },
    {
      filter: "model",
      translation: "Modelo",
    },
    {
      filter: "owner",
      translation: "Propietario",
    },
    {
      filter: "phone",
      translation: "Celular",
    },
    {
      filter: "plateNumber",
      translation: "Placa",
    },
    {
      filter: "type",
      translation: "Tipo",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const auxCounter = await getCountFromServer(ordersCollectionRef);
      setNumberOfPages(Math.ceil(auxCounter.data().count / ORDERS_LIMIT));
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      let dataRetrieved;
      if (ordersQuery === 0) {
        dataRetrieved = await getDocs(
          query(
            ordersCollectionRef,
            orderBy("time", "desc"),
            startAfter(queryStack[queryStack.length - 1]),
            limit(ORDERS_LIMIT)
          )
        );
      } else {
        dataRetrieved = await getDocs(
          query(
            ordersCollectionRef,
            orderBy(activeFilter.filter),
            startAt(capitalizeTextField(searchInput)),
            endAt(capitalizeTextField(searchInput) + "\uf8ff")
          )
        );
      }
      setLastDocumentVisible(dataRetrieved.docs[dataRetrieved.docs.length - 1]);
      setOrders(
        dataRetrieved.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
      setLoading(false);
    };
    fetchData();
  }, [currentPage, ordersQuery]);

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
      Nov: "Nov",
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

  const updateOrderStatus = async (id) => {
    let docRef = doc(db, "orders", id);
    let docData = await getDoc(docRef);
    await updateDoc(docRef, {
      ...docData.data(),
      status: 2,
      time: new Date(),
    });
    navigate(0);
  };

  const deleteOrder = async (id, imageURLs) => {
    const docRef = doc(db, "orders", id);
    const storage = getStorage();
    const deletionPromises = imageURLs.map((val, index) => {
      const imageRef = ref(storage, "images/" + `${`${id}_` + index}`);
      return deleteObject(imageRef).then((e) => {});
    });
    await Promise.all(deletionPromises);
    await deleteDoc(docRef);
    navigate(0);
  };

  const showConfirmationModal = (id) => {
    const modal = new tingle.modal({
      footer: true,
      stickyFooter: false,
      closeMethods: ["overlay", "button", "escape"],
      closeLabel: "",
      cssClass: ["custom-class-1"],
      onOpen: function () {},
      onClose: function () {},
      beforeClose: function () {
        return true;
      },
    });

    modal.setContent("<h1>¿Está seguro de que desea concluir esta orden?</h1>");
    modal.addFooterBtn(
      "Aceptar",
      "tingle-btn tingle-btn--primary tingle-btn--pull-right",
      () => {
        modal.setContent("<h1>Cargando...</h1>");
        updateOrderStatus(id);
      }
    );

    modal.addFooterBtn(
      "Cancelar",
      "tingle-btn tingle-btn--danger tingle-btn--pull-right",
      function () {
        modal.close();
      }
    );
    modal.open();
  };

  const showDeleteModal = (id, imageURLs) => {
    const modal = new tingle.modal({
      footer: true,
      stickyFooter: false,
      closeMethods: ["overlay", "button", "escape"],
      closeLabel: "",
      cssClass: ["custom-class-1"],
      onOpen: function () {},
      onClose: function () {},
      beforeClose: function () {
        return true;
      },
    });

    modal.setContent("<h1>¿Está seguro de que desea ELIMINAR esta orden?</h1>");
    modal.addFooterBtn(
      "Aceptar",
      "tingle-btn tingle-btn--primary tingle-btn--pull-right",
      () => {
        modal.setContent("<h1>Cargando...</h1>");
        deleteOrder(id, imageURLs);
      }
    );

    modal.addFooterBtn(
      "Cancelar",
      "tingle-btn tingle-btn--danger tingle-btn--pull-right",
      function () {
        modal.close();
      }
    );
    modal.open();
  };

  const openSortModal = () => {
    setIsToggleOpen(true);
  };

  const closeSortModal = () => {
    setIsToggleOpen(false);
  };

  const openOptionsDropdown = (ind) => {
    setIsOptionsOpen(ind);
  };

  const closeOptionsDropdown = () => {
    setIsOptionsOpen(-1);
  };

  const openDocumentPDF = (orderData) => {
    const printWindow = window.open(".", "", "height=400,width=800");
    let currentDate = new Date(orderData.billDate.seconds * 1000);
    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    ).toLocaleDateString("en-GB");
    let servicesString = "";
    if (Object.keys(orderData.services).length > 0) {
      let services = "";
      for (let key = 0; key < Object.keys(orderData.services).length; key++) {
        services += `<tr><td>${key + 1}</td><td>${
          orderData.services[key][0]
        }</td><td>${orderData.services[key][1]}</td></tr>`;
      }
      servicesString = `<div class="table-section"><h4>Servicios</h4></div><div class="table-section"><table><tr><th width="8%">#</th><th width="72%">Servicio</th><th>Precio</th></tr>${services}</table></div>`;
    }
    let sparesString = "";
    if (Object.keys(orderData.spares).length > 0) {
      let spares = "";
      for (let key = 0; key < Object.keys(orderData.spares).length; key++) {
        spares += `<tr><td>${key + 1}</td><td>${
          orderData.spares[key][0]
        }</td><td>${orderData.spares[key][1]}</td></tr>`;
      }
      sparesString = `<div class="table-section"><h4>Repuestos</h4></div><div class="table-section"><table><tr><th width="8%">#</th><th width="72%">Repuesto</th><th>Precio</th></tr>${spares}</table></div>`;
    }

    printWindow.document.write(
      `<html><head>
      <style>
        * {
          font-family: Verdana, Geneva, sans-serif;
        }
        html, body {
          width: 210mm;
          height: 297mm;
        }
        p {
          font-size: 1.17em;
        }
        .logo {
          display: flex;
          width: 100%;
          justify-content: end;
        }
        .logo-footer {
          display: flex;
          width: 100%;
          justify-content: end;
          font-size: 0.9rem;
          color: #5ab4c3;
          font-weight: 600;
          margin-bottom: 75px;
        }
        .table-section {
          display: flex;
          justify-content: center;
        }
        .price {
          display: flex;
          justify-content: start;
          padding: 2rem 0;
          font-size: 1.17em;
        }
        table {
            width: 75%;
            border-collapse: collapse;
        }
        td, th {
          border: 1px solid #b0b0b0;
          text-align: left;
          padding: 5px;
        }
        .footer {
          font-size: 1rem;
          color: #5c5c5c;
          text-align: center;
          position: fixed;
          bottom: 0;
        }
        
        @page {
          size: A4;
          margin: 11mm 17mm 17mm 17mm;
        }
      </style>
      </head>
      <body>
        <div class="logo">
          <img src="https://i.imgur.com/wKBO6wg.jpg" width="300px" height="100px"/>
        </div>
        <div class="logo-footer">Circuito Bolivia #6528/@jums.competition</div>
        <div><p><strong>Fecha: </strong>${currentDate}</p></div>
        <div><h3>Información personal</h3></div>
        <div class="table-section">
        <table>
        <tr>
          <th>Propietario:</th>
          <td>${orderData.owner}</td>
        </tr>
        <tr>
          <th>Celular:</th>
          <td>${orderData.phone}</td>
        </tr>
        <tr>
          <th>Vehículo:</th>
          <td>${orderData.brand + " " + orderData.model}</td>
        </tr>
          <tr>
          <th>Placa:</th>
          <td>${orderData.plateNumber}</td>
        </tr>
          <tr>
          <th>Kilometraje:</th>
          <td>${orderData.mileage}</td>
        </tr>
      </table>
        </div>
        <div><h3>Detalle</h3></div>
        ${servicesString}
        ${sparesString}
        <div class="price"><strong>Precio total:  </strong>&nbsp;${
          orderData.totalPrice + " "
        }Bs</div>
        `
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, "100");
  };

  const printOrder = (orderData) => {
    const printWindow = window.open(".", "", "height=400,width=800");
    let currentDate = new Date(orderData.billDate.seconds * 1000);
    const fuelLevels = { 0: "E", 0.25: "1/4", 0.5: "1/2", 0.75: "3/4", 1: "F" };
    currentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    ).toLocaleDateString("en-GB");
    let partDetails = [];
    for (let i = 0; i < Object.keys(orderData.partsDetail).length; i++) {
      partDetails.push(orderData.partsDetail[i]);
    }
    partDetails = partDetails.filter((e) => e[1]);
    let partDetailsString = "";
    partDetails.map((e) => (partDetailsString += `<tr><td>${e[0]}</td></tr>`));

    printWindow.document.write(
      `<html><head>
      <style>
        * {
          font-family: Verdana, Geneva, sans-serif;
        }
        html, body {
          width: 210mm;
          height: 297mm;
        }
        p {
          font-size: 1.17em;
        }
        .logo {
          display: flex;
          width: 100%;
          justify-content: end;
        }
        .logo-footer {
          display: flex;
          width: 100%;
          justify-content: end;
          font-size: 0.9rem;
          color: #5ab4c3;
          font-weight: 600;
          margin-bottom: 75px;
        }
        .table-section {
          display: flex;
          justify-content: center;
        }
        .price {
          display: flex;
          justify-content: start;
          padding: 2rem 0;
          font-size: 1.17em;
        }
        table {
            width: 75%;
            border-collapse: collapse;
        }
        .small-table {
          width: 40% !important;
        }
        td, th {
          border: 1px solid #b0b0b0;
          text-align: left;
          padding: 5px;
        }
        .footer {
          font-size: 1rem;
          color: #5c5c5c;
          text-align: center;
          position: fixed;
          bottom: 0;
        }
        
        @page {
          size: A4;
          margin: 11mm 17mm 17mm 17mm;
        }
      </style>
      </head>
      <body>
        <div class="logo">
          <img src="https://i.imgur.com/wKBO6wg.jpg" width="300px" height="100px"/>
        </div>
        <div class="logo-footer">Circuito Bolivia #6528/@jums.competition</div>
        <div><p><strong>Fecha: </strong>${currentDate}</p></div>
        <div><h3>Información personal</h3></div>
        <div class="table-section">
        <table>
        <tr>
          <th>Propietario:</th>
          <td>${orderData.owner}</td>
        </tr>
        <tr>
          <th>Celular:</th>
          <td>${orderData.phone}</td>
        </tr>
        <tr>
          <th>Vehículo:</th>
          <td>${orderData.brand + " " + orderData.model}</td>
        </tr>
        <tr>
          <th>Año:</th>
          <td>${orderData.year}</td>
        </tr> 
         <tr>
          <th>Placa:</th>
          <td>${orderData.plateNumber}</td>
        </tr>
          <tr>
          <th>Kilometraje:</th>
          <td>${orderData.mileage}</td>
        </tr>
        <tr>
          <th>Nivel de gasolina:</th>
          <td>${fuelLevels[orderData.gasLevel]}</td>
        </tr>
      </table>
        </div>
        ${
          orderData.previousDiagnostic
            ? `<div><h3>Diagnostico previo:</h3></div>
        <div>${orderData.previousDiagnostic}</div>`
            : ""
        }
        ${
          partDetails.length > 0
            ? `<div><h3>Partes con las que el vehiculo ingreso:</h3></div><div class="table-section"><table class="small-table">${partDetailsString}</table></div>`
            : ""
        }
          `
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, "100");
  };

  useOnClickOuside(sortRef, closeSortModal);
  // useOnClickOuside(optionsRef, closeSortModal);

  const capitalizeTextField = (text) => {
    let formattedText = text.split(" ");
    formattedText = formattedText.map(
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    );
    return formattedText.join(" ");
  };

  return (
    <Section>
      <div className="faqs">
        <div className="row">
          <div className="main-title row-input">
            <h2>Ordenes</h2>
          </div>
        </div>
        <div className="row-top">
          <div className="sort-button">
            <button
              onClick={isToggleOpen ? closeSortModal : openSortModal}
              className="button"
            >
              <BiFilterAlt className="toggle-icon" /> {activeFilter.translation}
            </button>
            <div className={`${isToggleOpen ? "sort-modal show" : "hide"}`}>
              <ul ref={sortRef}>
                {searchFilters.map((filt, index) => (
                  <li
                    key={index}
                    className={`${
                      filt.filter === activeFilter.filter ? "active-filter" : ""
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveFilter(filt);
                      }}
                    >
                      {filt.translation}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="search">
            <input
              type="text"
              placeholder="Buscar"
              onChange={(e) =>
                setSearchInput(
                  e.target.value.charAt(0).toUpperCase() +
                    e.target.value.slice(1).toLowerCase()
                )
              }
            />
            <button
              onClick={() => {
                if (searchInput === "") {
                  setOrdersQuery(0);
                } else {
                  setSearchInputTag(capitalizeTextField(searchInput));
                  setOrdersQuery(ordersQuery + 1);
                }
              }}
            >
              <BiSearch />
            </button>
          </div>
        </div>
        {ordersQuery > 0 && (
          <div className="row">
            <div className="search-result-label">
              Resultados de la busqueda: <span>{`"${searchInputTag}"`}</span>
            </div>
          </div>
        )}
        <div className="list">
          <ul className="labels">
            <li>Progreso</li>
            <li>Vehiculo</li>
            <li>Propietario</li>
            <li>Celular</li>
            <li>Fecha de recibo</li>
            <li>Precio(Bs)</li>
            <li>Opciones</li>
          </ul>
          {orders.map((order, index) => (
            <>
              <ul key={index} className="labels">
                <li data-label="Progreso">
                  <span
                    className={`progress-bubble ${
                      order.status === 0
                        ? "pending"
                        : order.status === 1
                        ? "active"
                        : "completed"
                    }`}
                  >
                    {order.status === 0
                      ? "Pendiente"
                      : order.status === 1
                      ? "Activo"
                      : "Completado"}
                  </span>
                </li>
                <li data-label="Vehiculo">
                  <p className="vehicle-label">
                    <div
                      className="div"
                      style={{
                        display: "block",
                        height: "17px",
                        width: "17px",
                        borderRadius: "50%",
                        backgroundColor: `${
                          findColorInArray(order.color)
                            ? findColorInArray(order.color)
                            : ""
                        }`,
                      }}
                    ></div>
                    {order.brand + " " + order.model}
                  </p>
                </li>
                <li data-label="Propietario">{order.owner}</li>
                <li data-label="Celular">{order.phone}</li>
                <li data-label="Fecha">{convertDate(order.billDate)}</li>
                <li data-label="Precio">{order.totalPrice} Bs</li>
                <li data-label="Opciones">
                  <button
                    className="options-button"
                    onClick={
                      isOptionsOpen === index
                        ? closeOptionsDropdown
                        : () => {
                            openOptionsDropdown(index);
                          }
                    }
                  >
                    <BiWrench />
                  </button>
                </li>
              </ul>
              <div
                className={` ${
                  isOptionsOpen === index ? "options-dropdown show" : "hide"
                }`}
              >
                <ul
                  ref={(node) => {
                    optionsRef.current[order] = node;
                    // useOnClickOuside(optionsRef, closeOptionsDropdown);
                  }}
                >
                  <li
                    className="option-li"
                    onClick={() => navigate(`edit/${order.id}`)}
                  >
                    <button>
                      <BiEdit /> Editar orden
                    </button>
                  </li>
                  <li
                    className="option-li"
                    onClick={() => {
                      printOrder(order);
                    }}
                  >
                    <button>
                      <BiPrinter /> Imprimir orden
                    </button>
                  </li>
                  <li
                    className="option-li"
                    onClick={() => navigate(`services/${order.id}`)}
                  >
                    <button>
                      <BiListOl /> {order.status === 0 ? "Agregar" : "Editar"}{" "}
                      repuestos/servicios
                    </button>
                  </li>
                  {order.status !== 0 && (
                    <li
                      className="option-li"
                      onClick={() => {
                        openDocumentPDF(order);
                      }}
                    >
                      <button>
                        <BiFile /> Generar recibo
                      </button>
                    </li>
                  )}
                  {order.status === 1 && (
                    <li
                      className="option-li close-order"
                      onClick={() => showConfirmationModal(order.id)}
                    >
                      <button>
                        <BiCheckCircle /> Concluir orden
                      </button>
                    </li>
                  )}
                  <li
                    className="option-li delete-order"
                    onClick={() => showDeleteModal(order.id, order.imageURLs)}
                  >
                    <button>
                      <BiTrash /> Eliminar orden
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ))}
        </div>

        {loading && (
          <div className="row" style={{ justifyContent: "center" }}>
            <div style={{ margin: "0 auto" }}>
              <ClockLoader color="#153d77" />
            </div>
          </div>
        )}

        {ordersQuery === 0 && (
          <div className="row pagination">
            {currentPage > 0 && (
              <button
                className="previous"
                onClick={() => {
                  const currentQueryStack = queryStack;
                  currentQueryStack.pop();
                  setQueryStack(currentQueryStack);
                  setCurrentPage(currentPage - 1);
                }}
              >
                <BiLeftArrowAlt /> <span className="label_text">Anterior</span>
              </button>
            )}
            {numberOfPages > 1 && currentPage < numberOfPages - 1 && (
              <button
                className="next"
                onClick={() => {
                  const currentQueryStack = queryStack;
                  currentQueryStack.push(lastDocumentVisible);
                  setQueryStack(currentQueryStack);
                  setCurrentPage(currentPage + 1);
                }}
              >
                <span className="label_text">Siguiente</span>{" "}
                <BiRightArrowAlt />
              </button>
            )}
          </div>
        )}
      </div>
      {orders.length === 0 && ordersQuery > 0 && (
        <div className="row">
          <div className="not-found">
            <BiTaskX /> No se encontro ninguna orden
          </div>
        </div>
      )}
    </Section>
  );
}

const Section = styled.section`
  width: 100%;
  flex-direction: column;
  display: flex;
  ${cardStyles}

  .search {
    background-color: var(--white);
    display: flex;
    border-color: var(--blue);
    align-items: center;
    gap: 1rem;
    width: 50%;
    border-radius: 0.6rem;
    border: 1px solid var(--blue);
    svg {
      color: var(--white);
      font-size: 1.5rem;
    }
    input {
      background-color: transparent;
      border: none;
      color: var(--black);
      width: 100%;
      height: 2rem;
      margin: 0.5rem;
      letter-spacing: 0.1rem;
      &:focus {
        outline: none;
      }
      &::placeholder {
        color: var(--blue);
        font-size: 1rem;
      }
    }
    button {
      right: 0;
      width: 15%;
      height: 50px;
      background: var(--blue);
      border: none;
      color: white;
      cursor: pointer;
      border-radius: 0 0.6rem 0.6rem 0;
    }
  }
  .search-result-label {
    font-size: 1.5rem;
    margin-left: 1rem;
    color: var(--appleSilver);
    span {
      color: var(--blue);
    }
  }

  .sort-button {
    display: flex;
    right: 0;
    width: 20%;
    position: relative;

    .button {
      width: 100%;
      display: flex;
      padding: 1rem;
      justify-content: center;
      font-size: 1.2rem;
      background-color: var(--blue);
      color: white;
      border: none;
      border-radius: 0.6rem;
      align-items: center;

      .toggle-icon {
        font-size: 1.6rem;
        margin-right: 3px;
      }
      &:hover {
        cursor: pointer;
      }
    }
  }

  .sort-modal {
    position: absolute;
    width: 150%;
    left: 0;
    top: calc(100% + 2px);

    ul {
      width: 67%;
      list-style-type: none;
      li {
        button {
          padding-top: 0.5rem;
          width: 100%;
          font-size: 1.2rem;
          background: var(--appleLightSilver);
          color: var(--appleSilver);
          padding: 0.5rem;
          border: none;

          &:hover {
            cursor: pointer;
          }
          border-bottom: solid 0.5px var(--white);
        }
      }
      .active-filter {
        button {
          background: var(--blue);
          color: white;
        }
      }
    }
    li:first-child {
      button {
        border-radius: 0.6rem 0.6rem 0 0 !important;
      }
    }
    li:last-child {
      button {
        border-radius: 0 0 0.6rem 0.6rem !important;
      }
    }
  }

  .main-title {
    display: flex;
    margin-bottom: 1rem;
    h2 {
      color: var(--blue);
      padding-left: 3rem;
      font-size: 2.5rem;
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

    input[type="submit"] {
      background-color: rgb(9, 125, 33);
      color: white;
      width: 40%;
      padding: 1rem;
      border-radius: 1rem;
      border: none;
      font-size: 1.5rem;
    }

    input[type="submit"]:hover {
      background-color: #086725;
    }
  }
  .centered-images {
    display: inline-block;
    margin: 0 auto;
  }

  .list {
    display: table;
    font-size: 1.2rem;
  }

  .list ul {
    display: table-row;
  }

  .list ul:first-child li {
    background-color: var(--appleSilver);
    color: #fff;
    padding-bottom: 1em;
    cursor: auto;
  }

  .list ul:first-child li:first-child {
    border-radius: 0.6rem 0 0 0;
  }

  .list ul:first-child li:last-child {
    border-radius: 0 0.6rem 0 0;
  }

  .list ul > li {
    display: table-cell;
    padding: 1em 1em 1em 1em;
    vertical-align: middle;
    border-bottom: dashed 1px var(--blue);
  }

  .progress-bubble {
    border-radius: 0.6rem;
    padding: 0.25em 0.4em;
    text-align: center;
    color: white;
    user-select: none;
  }

  .completed {
    background: #19d895;
  }

  .pending {
    background: #ff6258;
  }

  .active {
    background: #ffaf00;
  }

  .options-button {
    justify-content: center;
    justify-self: center;
    margin-left: 1vw;
    width: 50px;
    height: 50px;
    border-radius: 0.6rem;
    border: none;
    background-color: var(--appleLightSilver);
    cursor: pointer;
    svg {
      font-size: 1.8rem !important;
      color: var(--purple);
    }
  }

  .options-dropdown {
    position: absolute;
    /* top: calc(100% + 1px); */
    margin-right: 3vw;
    margin-top: -1.2rem;
    right: 2.5vw;
    ul {
      display: flex;
      flex-direction: column !important;
      li {
        padding: 0.6rem !important;
        align-items: center !important;
        background: var(--appleLightSilver) !important;
        button {
          background-color: var(--appleLightSilver);
          border: none;
          color: var(--purple);
          font-style: bold !important;
          font-size: 1.2rem;
          justify-content: center;
          svg {
            font-size: 1.5rem;
          }
        }
        border-bottom: solid 0.5px white;
      }
      li:first-child {
        border-radius: 0.6rem 0.6rem 0 0 !important;
      }
      li:last-child {
        border-radius: 0 0 0.6rem 0.6rem !important;
        border: none;
      }
      &:hover {
        background: transparent !important;
      }
      .close-order {
        background: #19d895 !important;
        button {
          background-color: #19d895;
          color: white;
        }
      }
      .delete-order {
        background: #ff6258 !important;
        button {
          background-color: #ff6258 !important;
          color: white;
        }
      }
    }
    .option-li:hover {
      background: var(--appleSilver) !important;
      button {
        background: var(--appleSilver) !important;
        color: white !important;
        cursor: pointer;
      }
      cursor: pointer;
    }
  }

  .pagination {
    display: block;
    /* justify-content: space-between; */
    .next {
      .label_text {
        vertical-align: 6px;
      }
      cursor: pointer;
      font-size: 1.2rem;
      background-color: var(--blue);
      color: white;
      padding: 0.7rem;
      border: none;
      border-radius: 0.6rem;
      margin-right: 1rem;
      float: right;
      vertical-align: auto;
      svg {
        font-size: 1.8rem;
      }
    }
    .previous {
      .label_text {
        vertical-align: 6px;
      }
      cursor: pointer;
      font-size: 1.2rem;
      background-color: var(--blue);
      color: white;
      padding: 0.7rem;
      border: none;
      border-radius: 0.6rem;
      svg {
        font-size: 1.8rem;
      }
    }
  }

  .not-found {
    display: flex;
    margin: 0 auto;
    align-items: center;
    font-size: 1.6rem;
    padding: 4rem 0;
    svg {
      font-size: 4rem;
    }
  }

  .vehicle-label {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .div {
      display: block;
      min-height: 17px;
      min-width: 17px;
      margin-right: 0.5rem;
    }
  }

  @media screen and (min-width: 660px) and (max-width: 1280px) {
    width: 100%;
    .main-title {
      justify-content: center;
      margin-bottom: 0;

      h2 {
        padding-left: 0;
        font-size: 2rem;
      }
    }

    .search {
      width: 50%;
      svg {
        font-size: 1.5rem !important;
      }
      button {
        width: 20%;
      }
    }

    .sort-modal {
      position: absolute;
      color: white;
      width: 100%;
      border-radius: 0.6rem;
      ul {
        width: 100%;
        list-style-type: none;
        li {
          button {
            padding-top: 0.5rem;
            width: 100%;
            font-size: 1.2rem;
            svg {
              font-size: 1.2rem !important;
            }
          }
        }
      }
    }

    .sort-button {
      width: 30%;
      .button {
        width: 100%;
        .toggle-icon {
          font-size: 1.2rem !important;
          margin-right: 3px;
        }
        &:hover {
          cursor: pointer;
        }
      }
    }

    .date-title {
      h2 {
        font-size: 1rem;
      }
    }

    svg {
      font-size: 2rem !important;
    }

    .row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      justify-content: space-between;
    }

    .row-top {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      width: 100%;
    }

    .row-input {
      display: block;
      flex-direction: row;
      width: 100%;
      textarea {
        min-width: 100%;
        max-width: 100%;
        min-height: 8rem;
        border-color: var(--blue);
        margin-top: 1rem;
      }
    }

    .label {
      width: 90%;
      margin-top: 0.5rem;
    }

    input[type="text"],
    input[type="number"],
    select {
      margin-right: 0;
    }

    .list {
      margin: 0;
    }

    .list ul {
      border: solid 3px var(--blue);
      border-radius: 0.6rem;
      display: block;
      list-style: none;
      margin-bottom: 1rem;
      padding: 0.5rem;
      width: 100%;

      li {
      }
    }

    .list ul:hover {
      background-color: var(--white);
      color: var(--purple);
      cursor: auto;
    }

    .labels {
      &:first-child {
        display: none;
      }
    }

    .list ul > li {
      display: block;
      padding: 0.25em 0;
      border-bottom: dashed 1px var(--plomo);
    }
    .list ul > li:before {
      color: var(--blue);
      content: attr(data-label);
      display: inline-flex;
      font-size: 100%;
      font-weight: bold;
      text-transform: capitalize;
      vertical-align: top;
      width: 50%;
    }

    .list p {
      margin: -1em 0 0 50%;
    }

    .options-dropdown {
      position: absolute;
      height: auto;
      color: white;
      margin-top: -2rem !important;
      right: 180px !important;
      width: 280px !important;
      display: flex !important;
      ul {
        display: flex !important;
        flex-direction: column !important;
        border: none;
        width: auto;
        padding: 0 !important;
        li {
          padding: 0 !important;
          align-items: center !important;
          background: var(--appleLightSilver) !important;
          width: auto;
          height: 60px;
          padding-top: 8px !important;

          button {
            background-color: var(--appleLightSilver);
            border: none;
            color: var(--purple);
            font-style: bold !important;
            font-size: 1.2rem;
            justify-content: center;
            margin: 0 !important;
            margin-left: 10px !important;
            padding: 0 !important;
            svg {
              font-size: 1.2rem !important;
            }
          }
          border-bottom: solid 0.5px white;
          &::before {
            content: none;
          }
        }
      }
    }
    .option-li {
      height: 40px !important;
      padding: 0 !important;
      button {
        margin: 0 !important;
      }
    }
    .pagination {
      display: block;
      /* justify-content: space-between; */
      .next {
        .label_text {
          vertical-align: 8px;
        }
      }
      .previous {
        .label_text {
          vertical-align: 8px;
        }
      }
    }
    .not-found {
      svg {
        font-size: 5rem !important;
        padding: 10px;
      }
    }
  }
  @media screen and (min-width: 280px) and (max-width: 659px) {
    width: 100%;
    .main-title {
      justify-content: center;
      margin-bottom: 0;

      h2 {
        padding-left: 0;
        font-size: 2rem;
      }
    }

    .search {
      width: 100%;
      input {
        font-size: 16px !important;
      }
      svg {
        font-size: 1.5rem !important;
      }
      button {
        width: 30%;
      }
    }

    .search-result-label {
      font-size: 1.3rem;
    }

    .sort-button {
      width: auto;
      right: 0;
      margin: 0.2rem;
      justify-content: end;
      position: relative;
      .button {
        font-size: 0rem;
        width: 100%;
        .toggle-icon {
          font-size: 1.5rem !important;
        }
      }
    }

    .sort-modal {
      position: absolute;
      color: white;
      width: 300%;
      border-radius: 0.6rem;
      ul {
        width: 100%;
        list-style-type: none;
        li {
          button {
            padding-top: 0.5rem;
            width: 100%;
            font-size: 1.2rem;
            border: solid 1px white;
            svg {
              font-size: 1.2rem !important;
            }
          }
        }
      }
    }

    .date-title {
      h2 {
        font-size: 1rem;
      }
    }

    svg {
      font-size: 2rem !important;
    }

    .row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      justify-content: space-between;
    }

    .row-top {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      width: 100%;
    }

    .row-input {
      display: block;
      flex-direction: row;
      width: 100%;
      textarea {
        min-width: 100%;
        max-width: 100%;
        min-height: 8rem;
        border-color: var(--blue);
        margin-top: 1rem;
      }
    }

    .label {
      width: 90%;
      margin-top: 0.5rem;
    }

    input[type="text"],
    input[type="number"],
    select {
      margin-right: 0;
    }

    .list {
      margin: 0;
    }

    .list ul {
      border: solid 3px var(--blue);
      border-radius: 0.6rem;
      display: block;
      list-style: none;
      margin-bottom: 1rem;
      padding: 0.5rem;
      width: 100%;

      li {
      }
    }

    .list ul:hover {
      background-color: var(--white);
      color: var(--purple);
      cursor: auto;
    }

    .list ul:first-child {
      display: none;
    }

    .list ul > li {
      display: block;
      padding: 0.25em 0;
      border-bottom: dashed 1px var(--plomo);
    }
    .list ul > li:before {
      color: var(--blue);
      content: attr(data-label);
      display: inline-flex;
      font-size: 100%;
      font-weight: bold;
      text-transform: capitalize;
      vertical-align: top;
      width: 50%;
    }

    .list p {
      margin: -1em 0 0 50%;
    }

    .progress-bubble {
      border-radius: 0.6rem;
      padding: 0.25em 0.4em;
      text-align: center;
      color: white;
      user-select: none;
    }

    .options-dropdown {
      position: absolute;
      height: auto;
      color: white;
      margin-top: -2rem !important;
      right: 0px !important;
      width: 280px !important;
      display: flex !important;
      ul {
        display: flex !important;
        flex-direction: column !important;
        border: none;
        width: auto;
        padding: 0 !important;
        li {
          padding: 0 !important;
          align-items: center !important;
          background: var(--appleLightSilver) !important;
          width: auto;
          height: 60px;
          padding-top: 8px !important;

          button {
            background-color: var(--appleLightSilver);
            border: none;
            color: var(--purple);
            font-style: bold !important;
            font-size: 1.2rem;
            justify-content: center;
            margin: 0 !important;
            margin-left: 10px !important;
            padding: 0 !important;
            svg {
              font-size: 1.2rem !important;
            }
          }
          border-bottom: solid 0.5px white;
          &::before {
            content: none;
          }
        }
      }
    }
    .option-li {
      height: 40px !important;
      padding: 0 !important;
      button {
        margin: 0 !important;
      }
    }
    .pagination {
      display: block;
      /* justify-content: space-between; */
      .next {
        .label_text {
          vertical-align: 7px;
        }
        font-size: 1.2rem;
        margin-right: 0;
        float: right;
        vertical-align: auto;
        svg {
          font-size: 1.6rem;
        }
      }
      .previous {
        .label_text {
          vertical-align: 7px;
        }
        font-size: 1.2rem;

        svg {
          font-size: 1.6rem;
        }
      }
    }
    .not-found {
      svg {
        font-size: 7rem !important;
        padding: 10px;
      }
    }
    .vehicle-label {
      display: flex;
      align-items: center;
      .div {
        margin-right: 0.3rem;
      }
    }
  }
`;
