import { type Element } from "./ElementsTypes";

export const ELEMENTS_MOCK: Element[] = [
  {
    id: 1,
    name: "Карбонат кальция (Mock)",
    description:
      "Неорганическое соединение, соль угольной кислоты и кальция. Данные загружены из mock-файла.",
    formula: "CaCO₃",
    image: "/images/1.png", // Путь к картинке в Minio
  },
  {
    id: 2,
    name: "Гидроксид меди (II) (Mock)",
    description:
      "Нерастворимое в воде голубое твердое вещество. Данные загружены из mock-файла.",
    formula: "Cu(OH)₂",
    image: "/images/2.png",
  },
  {
    id: 3,
    name: "Сульфат бария (Mock)",
    description:
      "Нерастворимое в воде неорганическое вещество белого цвета. Данные загружены из mock-файла.",
    formula: "BaSO₄",
    image: null, // Пример элемента без картинки
  },
];
