import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ImageUploading from "react-images-uploading";
import { cardStyles } from "../components/ReusableStyles";
import { MdOutlineRemove } from "react-icons/md";
import ColorPicker from "../components/ColorPicker";
import tingle from "tingle.js";
import CheckButtonGroup from "../components/CheckButtonGroup";
import { useNavigate, useParams } from "react-router-dom";
import { BeatLoader, FadeLoader } from "react-spinners";

import { db } from "../firebase";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const OrderSchema = yup.object().shape({
  ciNit: yup.string().matches(/^[0-9]*?$/, "CI/NIT invalido"),
  owner: yup
    .string()
    .required("El nombre del propietario es requerido")
    .matches(
      /^[A-Za-zñÑáéíóúÁÉÍÓÚ]+(?:[\s-][A-Za-zñÑáéíóúÁÉÍÓÚ]+)*$/,
      "Nombre invalido"
    ),
  telNumber: yup.string().matches(/^[0-9]*?$/, "Telefono invalido"),
  phone: yup
    .string()
    .required("El celular es requerido")
    .matches(/^[0-9]*?$/, "Celular invalido"),
  type: yup.string().required(),
  plateNumber: yup
    .string()
    .required("La placa es requerida")
    .matches(/^[a-zA-Z0-9]+$/, "Placa invalida"),
  brand: yup
    .string()
    .required("La marca es requerida")
    .matches(
      /^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ]+(?:[\s-][A-Za-z0-9ñÑáéíóúÁÉÍÓÚ]+)*$/,
      "Marca invalida"
    ),
  model: yup
    .string()
    .required("El modelo es requerido")
    .matches(
      /^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ]+(?:[\s-][A-Za-z0-9ñÑáéíóúÁÉÍÓÚ]+)*$/,
      "Modelo invalido"
    ),
  year: yup
    .string()
    .required("El año es requerido")
    .matches(/^[0-9]*?$/, "invalido"),
  mileage: yup
    .string()
    .required("El kilometraje es requerido")
    .matches(/^[0-9]*?$/, "Kilometraje invalido"),
  previousDiagnostic: yup.string(),
});

export default function EditOrderPage() {
  const [dateValue, setDateValue] = useState(new Date());
  const [carType, setCarType] = useState("Sedan");
  const [selectedColor, setSelectedColor] = useState([]);
  const [selectedParts, setSelectedParts] = useState([]);

  const [fuelLevels, setFuelLevels] = useState([
    { level: "E", value: true },
    { level: "1/4", value: false },
    { level: "1/2", value: false },
    { level: "3/4", value: false },
    { level: "F", value: false },
  ]);
  const [images, setImages] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { order_id } = useParams();
  const docRef = doc(db, "orders", order_id);

  const weekday = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
  ];

  const yearMonths = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm({
    resolver: yupResolver(OrderSchema),
  });

  async function retrieveImages(dataRetrieved) {
    setImagesLoading(true);
    const imagesRetrieved = [];
    let index = 0;
    for (const url of dataRetrieved) {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `image_${index}.jpg`, {
        type: "image/jpeg",
      });
      imagesRetrieved.push({ data_url: url, file: file });
      index++;
    }
    setImages(imagesRetrieved);
    setImagesLoading(false);
  }

  useEffect(() => {
    (async () => {
      let dataRetrieved = await getDoc(docRef);
      dataRetrieved = { ...dataRetrieved.data() };
      setValue("ciNit", dataRetrieved.ciNit);
      setValue("owner", dataRetrieved.owner);
      setValue("telNumber", dataRetrieved.telNumber);
      setValue("phone", dataRetrieved.phone);
      setValue("type", dataRetrieved.type);
      setValue("plateNumber", dataRetrieved.plateNumber);
      setValue("brand", dataRetrieved.brand);
      setValue("model", dataRetrieved.model);
      setValue("year", dataRetrieved.year);
      setValue("mileage", dataRetrieved.mileage);
      setValue("previousDiagnostic", dataRetrieved.previousDiagnostic);
      setCarType(dataRetrieved.type);
      setImageURLs(dataRetrieved.imageURLs);

      if (dataRetrieved.imageURLs) {
        await retrieveImages(dataRetrieved.imageURLs);
      }

      const dateConverted = new Date(dataRetrieved.billDate.seconds * 1000);
      setDateValue(dateConverted);

      const fuelLevelsCopy = fuelLevels.map((fl, index) => {
        if (index === dataRetrieved.gasLevel * 4) {
          return { level: fl.level, value: true };
        } else {
          return { level: fl.level, value: false };
        }
      });

      setFuelLevels(fuelLevelsCopy);
      // console.log(colorPairRetrieved);
    })();
  }, []);

  const getColor = (color) => {
    setSelectedColor(color);
  };

  const getSelectedParts = (parts) => {
    setSelectedParts(parts);
  };

  function handleChangeDate(e) {
    const currentDate = e.target.valueAsDate;
    currentDate.setTime(currentDate.getTime() + 24 * 60 * 60 * 1000);
    setDateValue(currentDate);
  }

  function handleChangeCarType(e) {
    console.log(e.target.value);
    setCarType(e.target.value);
  }

  function handleChangeFuelLevel(e, content) {
    const fuelLevelsCopy = fuelLevels.map((elem) => ({
      level: elem.level,
      value: content === elem.level,
    }));
    setFuelLevels(fuelLevelsCopy);
  }

  const onChangeImage = (imageList, addUpdateIndex) => {
    setImages(imageList);
  };

  const capitalizeTextField = (text) => {
    let formattedText = text.split(" ");
    formattedText = formattedText.map(
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    );
    return formattedText.join(" ");
  };

  const uploadImagesAndRetrieveLinks = async (imagesAsFiles, orderId) => {
    let imgUrls = [];
    const storage = getStorage();
    const deletionPromises = imageURLs.map((val, index) => {
      const imageRef = ref(storage, `images/${`${orderId}_` + index}`);
      return deleteObject(imageRef).then((e) => {});
    });
    await Promise.all(deletionPromises);

    const promises = imagesAsFiles.map((image, index) => {
      const imageRef = ref(storage, `images/${`${orderId}_` + index}`);
      return uploadBytes(imageRef, image).then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      });
    });

    imgUrls = await Promise.all(promises);
    return imgUrls;
  };

  const onSubmit = async (e) => {
    setLoading(true);
    let formData = { ...getValues() };
    formData.owner = capitalizeTextField(formData.owner);
    formData.brand = capitalizeTextField(formData.brand);
    formData.model = capitalizeTextField(formData.model);
    formData.year = parseInt(formData.year);
    formData.mileage = parseInt(formData.mileage);
    let gasLevelNumber = fuelLevels.findIndex((fl) => fl.value === true);
    gasLevelNumber = gasLevelNumber / 4;
    const partsMap = { ...selectedParts };
    const imagesAsFiles = images.map((img) => img.file);
    await updateDoc(docRef, {
      ...formData,
      billDate: dateValue,
      color: selectedColor[0],
      gasLevel: gasLevelNumber,
      partsDetail: partsMap,
      time: new Date(),
    });
    if (images.length > 0) {
      let imgUrls = await uploadImagesAndRetrieveLinks(
        imagesAsFiles,
        docRef.id,
        formData.imageURLs
      );
      await updateDoc(docRef, {
        imageURLs: imgUrls,
      });
    }
    setLoading(false);
    await navigate("../orders");
  };

  const modal = new tingle.modal({
    footer: false,
    closeMethods: ["overlay", "button", "escape"],
    closeLabel: "",
    cssClass: ["custom-class-1", "custom-class-2"],
    onOpen: function () {},
    onClose: function () {},
    beforeClose: function () {
      return true;
    },
  });

  const showImageModal = (imageData) => {
    modal.setContent(`<img class="image-inside-modal" src=${imageData} />`);
    modal.open();
  };

  const showDeleteImageModal = (deleteImage, index) => {
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

    modal.setContent(
      "<h1>¿Está seguro de que desea ELIMINAR esta imagen?</h1>"
    );
    modal.addFooterBtn(
      "Aceptar",
      "tingle-btn tingle-btn--primary tingle-btn--pull-right",
      () => {
        modal.setContent("<h1>Cargando...</h1>");
        deleteImage(index);
        modal.close();
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

  return (
    <Section>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="faqs">
          <div className="row">
            <div className="main-title row-input date">
              <h2>Editar orden</h2>
            </div>
            <div
              className="row-input date"
              style={{
                justifyContent: "center",
              }}
            >
              <div className="date-title">
                <h2 style={{ color: "var(--purple)" }}>Fecha de recibo: </h2>
              </div>
              <div className="calendar">
                <StyledInput
                  type="date"
                  onChange={(e) => handleChangeDate(e)}
                  value={
                    new Date(dateValue - 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                />
                {dateValue && (
                  <>
                    <p id="monthName">{yearMonths[dateValue.getMonth()]}</p>
                    <p id="dayName">{weekday[dateValue.getDay()]}</p>
                    <p id="dayNumber">{dateValue.getDate()}</p>
                    <p id="year">{dateValue.getFullYear()}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="title" style={{ paddingTop: "2rem" }}>
          <h2>Informacion del cliente</h2>
        </div>
        <div className="faqs">
          <div className="row">
            <div className="row-input">
              <div className="label">CI/NIT</div>
              <div className="input-whole">
                <div className="input-whole">
                  <input
                    autoComplete="off"
                    type="text"
                    className={errors.ciNit ? "input-errors" : ""}
                    {...register("ciNit", {
                      required: false,
                      maxLength: 10,
                    })}
                  />
                  <div className="errors-message">
                    {errors.ciNit && <p>{errors.ciNit.message}</p>}
                  </div>
                </div>
              </div>
            </div>
            <div className="row-input">
              <div className="label">
                Propietario<span style={{ color: "red" }}> * </span>:{" "}
              </div>
              <div className="input-whole">
                <input
                  autoComplete="off"
                  type="text"
                  className={errors.owner ? "input-errors" : ""}
                  {...register("owner", { required: true, maxLength: 20 })}
                />
                <div className="errors-message">
                  {errors.owner && <p>{errors.owner.message}</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="row-input">
              <div className="label">Telefono: </div>
              <div className="input-whole">
                <input
                  autoComplete="off"
                  type="number"
                  onKeyDown={(evt) =>
                    (evt.key === "e" || evt.key === "-" || evt.key === ".") &&
                    evt.preventDefault()
                  }
                  className={errors.telNumber ? "input-errors" : ""}
                  {...register("telNumber", { min: 1, max: 99999999 })}
                />
                <div className="errors-message">
                  {errors.telNumber && <p>{errors.telNumber.message}</p>}
                </div>
              </div>
            </div>
            <div className="row-input">
              <div className="label">
                Celular<span style={{ color: "red" }}> * </span>:{" "}
              </div>
              <div className="input-whole">
                <input
                  autoComplete="off"
                  type="number"
                  onKeyDown={(evt) =>
                    (evt.key === "e" || evt.key === "-" || evt.key === ".") &&
                    evt.preventDefault()
                  }
                  className={errors.phone ? "input-errors" : ""}
                  {...register("phone", { min: 1, max: 9999999 })}
                />
                <div className="errors-message">
                  {errors.phone && <p>{errors.phone.message}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="title" style={{ paddingTop: "4rem" }}>
          <h2>Informacion del vehiculo</h2>
        </div>
        <div className="faqs">
          <div className="row">
            <div className="row-input">
              <div className="label">
                Tipo<span style={{ color: "red" }}> * </span>:
              </div>

              <select
                {...register("type")}
                onChange={handleChangeCarType}
                value={carType}
                className={errors.type ? "input-errors" : ""}
              >
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="Vagoneta">Vagoneta</option>
                <option value="Deportivo">Deportivo</option>
                <option value="Bus">Bus</option>
                <option value="Van">Van</option>
                <option value="Camion">Camion</option>
                <option value="Camioneta">Camioneta</option>
              </select>
              {errors.type && <p>{errors.type.message}</p>}
            </div>
            <div className="row-input">
              <div className="label">
                Placa<span style={{ color: "red" }}> * </span>:
              </div>
              <div className="input-whole">
                <input
                  autoComplete="off"
                  type="text"
                  className={errors.plateNumber ? "input-errors" : ""}
                  {...register("plateNumber", {
                    required: true,
                    maxLength: 20,
                  })}
                />
                <div className="errors-message">
                  {errors.plateNumber && <p>{errors.plateNumber.message}</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="row-input">
              <div className="label">
                Marca<span style={{ color: "red" }}> * </span>:
              </div>
              <div className="input-whole">
                <input
                  autoComplete="off"
                  type="text"
                  className={errors.brand ? "input-errors" : ""}
                  {...register("brand", { required: true, maxLength: 20 })}
                />
                <div className="errors-message">
                  {errors.brand && <p>{errors.brand.message}</p>}
                </div>
              </div>
            </div>

            <div className="row-input">
              <div className="label">
                Modelo<span style={{ color: "red" }}> * </span>:
              </div>
              <div className="input-whole">
                <input
                  autoComplete="off"
                  type="text"
                  className={errors.model ? "input-errors" : ""}
                  {...register("model", { required: true, maxLength: 20 })}
                />
                <div className="errors-message">
                  {errors.model && <p>{errors.model.message}</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="row-input year">
              <div className="label">
                Año<span style={{ color: "red" }}> * </span>:
              </div>
              <div className="input-whole">
                <input
                  type="number"
                  className={errors.year ? "input-errors" : ""}
                  min="1900"
                  onKeyDown={(evt) =>
                    (evt.key === "e" || evt.key === "-" || evt.key === ".") &&
                    evt.preventDefault()
                  }
                  defaultValue="2016"
                  {...register("year", { min: 1, max: 9999999 })}
                />
                <div className="errors-message">
                  {errors.year && <p>{errors.year.message}</p>}
                </div>
              </div>
            </div>
            <div className="row-input small">
              <div className="label">
                Color<span style={{ color: "red" }}> * </span>:
              </div>
              <ColorPicker sendColor={getColor} />
            </div>

            <div className="row-input small">
              <div className="label">
                Kilometraje<span style={{ color: "red" }}> * </span>:
              </div>
              <div className="input-whole">
                <input
                  type="number"
                  min="0"
                  defaultValue={1}
                  onKeyDown={(evt) =>
                    (evt.key === "e" || evt.key === "-" || evt.key === ".") &&
                    evt.preventDefault()
                  }
                  className={errors.mileage ? "input-errors" : ""}
                  {...register("mileage", { min: 1, max: 9999999 })}
                />
                <div className="errors-message">
                  {errors.mileage && <p>{errors.mileage.message}</p>}
                </div>
              </div>
            </div>
            <div className="row-input fuel-buttons">
              <div className="label">
                Nivel de gasolina<span style={{ color: "red" }}> * </span>:
              </div>
              <div className="fuel-level">
                {fuelLevels &&
                  fuelLevels.map((elem, index) => (
                    <button
                      className={`fuel ${elem.value ? "active" : ""}`}
                      type="button"
                      key={index}
                      onClick={(e) => {
                        handleChangeFuelLevel(e, elem.level);
                      }}
                    >
                      {elem.level}
                    </button>
                  ))}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="row-input" style={{ width: "100%" }}>
              <div className="label">Diagnostico previo: </div>

              <textarea
                {...register("previousDiagnostic", {
                  required: false,
                  maxLength: 250,
                })}
              />
            </div>
          </div>
          <div className="row">
            <div className="label">Detalle de partes: </div>
            <CheckButtonGroup sendParts={getSelectedParts} />
          </div>
        </div>
        <div
          className="title"
          style={{ paddingTop: "2rem", textAlign: "center" }}
        >
          <h2>Imagenes adicionales</h2>
        </div>

        <div className="row">
          <div className="row-input-images" style={{ width: "100%" }}>
            <div className="centered-images">
              <div className="images-zone">
                <ImageUploading
                  multiple
                  value={images}
                  onChange={onChangeImage}
                  maxNumber={6}
                  dataURLKey="data_url"
                  acceptType={["jpg", "png", "jpeg"]}
                >
                  {({
                    imageList,
                    onImageUpload,
                    onImageRemoveAll,
                    onImageUpdate,
                    onImageRemove,
                    isDragging,
                    dragProps,
                  }) => (
                    // write your building UI
                    <>
                      {imagesLoading && (
                        <div className="image-item image-loader">
                          <FadeLoader color="#ffffff" />
                        </div>
                      )}
                      {imageList.map((image, index) => (
                        <div key={index} className="image-item">
                          <img
                            src={image.data_url}
                            alt=""
                            className="image"
                            onClick={() => showImageModal(image.data_url)}
                          />
                          <button
                            onClick={() =>
                              showDeleteImageModal(onImageRemove, index)
                            }
                            className="image-close-button"
                            type="button"
                          >
                            <MdOutlineRemove />
                          </button>
                        </div>
                      ))}
                      {imageList.length < 6 && (
                        <button
                          type="button"
                          style={isDragging ? { color: "red" } : null}
                          className="image-uploader"
                          onClick={onImageUpload}
                          {...dragProps}
                        >
                          +
                        </button>
                      )}
                    </>
                  )}
                </ImageUploading>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="submit-button" disabled={loading}>
            <button type="submit">
              {loading ? <BeatLoader color="#ffffff" /> : "Guardar cambios"}
            </button>
          </div>
        </div>
      </form>
    </Section>
  );
}
const Section = styled.section`
  ${cardStyles};
  width: 100%;
  flex-direction: column;
  display: flex;

  .main-title {
    display: flex;

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

  .calendar {
    position: relative;
    min-width: 150px;
    max-width: 150px;
    background: #fff;
    text-align: center;
    border-radius: 1rem;
    border: 2px solid var(--blue);
    overflow: hidden;
  }

  .calendar #monthName {
    padding: 5px 10px;
    background: var(--blue);
    color: #fff;
    font-size: 25px;
  }

  .calendar #dayName {
    margin: 5px;
    font-size: 20px;
    font-weight: 300;
    color: #464646;
  }

  .calendar #dayNumber {
    margin: 0;
    line-height: 1em;
    font-size: 60px;
    font-weight: 600;
    color: #2c2c2c;
  }

  .calendar #year {
    margin-bottom: 5px;
    font-size: 20px;
    font-weight: 700;
    color: #999;
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

  .row {
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

  .row-input-images {
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

  input[type="text"],
  input[type="number"],
  select {
    display: flex;
    border-bottom: 1px solid var(--blue);
    border-right: none;
    border-left: none;
    border-top: none;
    height: 50px;
    padding: 0rem;
    margin: 0;
    outline: 0;
    width: 100%;
    color: var(--black);
    margin-right: 2rem;
    font-size: 1.3rem;
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* Firefox */
    -moz-appearance: textfield;
  }

  input[type="text"]:hover,
  input[type="number"]:hover,
  select:hover {
    border-bottom: 2px solid var(--blue);
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

  .fuel-buttons {
    width: 35%;
  }

  .year {
    width: 15%;
  }

  .fuel {
    height: 2.6rem;
    width: 2.6rem;
    font-size: 1.3rem;
    color: black;
    background-color: var(--appleLightSilver);
    border: none;
    margin: 2px 2px 2px 2px;
  }

  .fuel:hover {
    background-color: #da0037;
    color: white;
  }

  .fuel.active {
    background-color: var(--blue);
    color: white;
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
  .centered-images {
    display: inline-block;
    margin: 0 auto;
  }

  .images-zone {
    display: grid;
    grid-template-columns: auto auto auto auto auto auto;
    height: 220px;
    border-radius: 1rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
    background: var(--appleSilver);
  }

  .image-uploader {
    width: 200px;
    height: 200px;
    margin: 10px 10px 10px 10px;
    padding: 0px;
    background: transparent;
    color: var(--white);
    text-align: center;
    font-size: 5rem;
    border-radius: 1rem;
    border: 0.5rem dashed var(--white) !important;
  }

  .image-item {
    position: relative;
  }

  .image-item__btn-wrapper {
    position: relative;
  }
  .image-close-button {
    background: #da0037;
    color: white;
    font-size: 2.5rem;
    cursor: pointer;
    font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;
    border-radius: 50%;
    border: none !important;
    position: absolute;
    width: 40px;
    height: 40px;
    top: 0.3rem;
    right: 0.3rem;
  }
  .image-loader {
    display: flex;
    align-items: center;
    margin: 0 5rem;
  }

  .upload__image-wrapper {
    display: inline-block;
  }
  .image {
    border-radius: 1rem;
    margin: 10px 10px 10px 10px;
    width: 200px;
    height: 200px;
    object-fit: cover;
  }
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type="number"] {
    -moz-appearance: textfield;
  }

  @media screen and (min-width: 280px) and (max-width: 1080px) {
    width: 100%;
    .main-title {
      padding-bottom: 2rem;
      justify-content: center;

      h2 {
        padding-left: 0;
        font-size: 2rem;
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

    .row-input.date {
      display: flex;
      flex-direction: row;
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

    .row-input-images {
      display: flex;
      .images-zone {
        grid-template-columns: auto;
        height: auto;
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

    .fuel {
      height: 3rem;
      width: 3rem;
      font-size: 1.5rem;
    }

    .small,
    .year,
    .fuel-buttons {
      width: 100%;
    }

    .fuel-level {
      display: table;
      margin: 0 auto;
    }

    .submit-button {
      button[type="submit"] {
        width: 100%;
      }
    }
    .images-zone {
      grid-template-columns: auto;
      height: auto;
    }
    .image-close-button {
      font-size: 1rem;
    }
    .image-loader {
      margin: 5rem 5rem;
    }
  }
`;

const StyledInput = styled.input`
  position: absolute;
  top: 0;
  right: 0;
  background: transparent;
  font-size: 1.5rem;
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  color: transparent !important;
  ::-webkit-datetime-edit-text {
    display: none;
  }
  ::-webkit-datetime-edit-month-field {
    display: none;
  }
  ::-webkit-datetime-edit-day-field {
    display: none;
  }
  ::-webkit-datetime-edit-year-field {
    display: none;
  }
  ::-webkit-inner-spin-button {
  }
  ::-webkit-calendar-picker-indicator {
    background: transparent;
    color: black;
    width: 100%;
    height: 100%;
    font-size: 3rem;
  }
`;
