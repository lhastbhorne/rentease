import {
  FaBuilding,
  FaHome,
  FaWarehouse,
  FaCity,
  FaStore,
  FaHotel,
} from "react-icons/fa";

const categories = [
  {
    id: 1,
    name: "Apartments",
    icon: FaBuilding,
    count: "320+ Properties",
  },
  {
    id: 2,
    name: "Duplexes",
    icon: FaHome,
    count: "150+ Properties",
  },
  {
    id: 3,
    name: "Studios",
    icon: FaHotel,
    count: "90+ Properties",
  },
  {
    id: 4,
    name: "Commercial",
    icon: FaStore,
    count: "180+ Properties",
  },
  {
    id: 5,
    name: "Warehouses",
    icon: FaWarehouse,
    count: "60+ Properties",
  },
  {
    id: 6,
    name: "Office Spaces",
    icon: FaCity,
    count: "120+ Properties",
  },
];

export default categories;