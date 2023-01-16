export const colorsForPicker = [
  ["Negro", "#000000"],
  ["Blanco", "#edebeb"],
  ["Plomo", "#808080"],
  ["Azul", "#0404ce"],
  ["Celeste", "#00c3ff"],
  ["Verde Claro", "#0bb30b"],
  ["Verde Oscuro", "#0d680d"],
  ["Rosado", "#FF00FF"],
  ["Amarillo", "#FFFF00"],
  ["Naranja", "#ff6f00"],
  ["Rojo", "#ff0000"],
];

export const findColorInArray = (color) => {
  let ans;
  const index = colorsForPicker.findIndex((elem) => elem[0] === color);
  if (index !== -1) {
    ans = colorsForPicker[index][1];
  } else {
    ans = "";
  }
  return ans;
};
