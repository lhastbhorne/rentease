import {
  FaWifi,
  FaSwimmingPool,
  FaCar,
  FaSnowflake,
  FaShieldAlt,
  FaDumbbell,
  FaBolt,
  FaPaw,
} from "react-icons/fa";

const property = {
  address: "12 Admiralty Way, Lekki Phase 1, Lagos",

  coordinates: {
    lat: 6.4474,
    lng: 3.4723,
  },
  id: 1,

  title: "Luxury Apartment in Lekki",

  location: "Lekki, Lagos",

  price: "$1,200/month",

  description:
    "Experience modern living in this beautifully designed luxury apartment located in the heart of Lekki. It features spacious bedrooms, a fitted kitchen, ample parking, backup power, 24-hour security, and easy access to schools, shopping malls, hospitals, and major roads.",

  type: "Apartment",

  status: "Available",

  bedrooms: 3,

  bathrooms: 2,

  area: "1,800 sqft",

  parking: "2 Spaces",

  furnished: "Yes",

  yearBuilt: "2024",

  deposit: "$2,400",

  leaseDuration: "12 Months",

  availableFrom: "Immediately",

  images: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
    "https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200",
  ],

  amenities: [
    {
      id: 1,
      name: "Wi-Fi",
      icon: FaWifi,
    },
    {
      id: 2,
      name: "Swimming Pool",
      icon: FaSwimmingPool,
    },
    {
      id: 3,
      name: "Parking",
      icon: FaCar,
    },
    {
      id: 4,
      name: "Air Conditioning",
      icon: FaSnowflake,
    },
    {
      id: 5,
      name: "24/7 Security",
      icon: FaShieldAlt,
    },
    {
      id: 6,
      name: "Gym",
      icon: FaDumbbell,
    },
    {
      id: 7,
      name: "Backup Power",
      icon: FaBolt,
    },
    {
      id: 8,
      name: "Pet Friendly",
      icon: FaPaw,
    },
  ],
  contact: {
    name: "John Doe",
    role: "Verified Property Agent",
    phone: "+2348012345678",
    whatsapp: "+2348012345678",
    email: "john@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },

  relatedProperties: [
    {
      id: 2,
      title: "Modern Duplex in Ikoyi",
      location: "Ikoyi, Lagos",
      price: "$2,500/month",
      image:
        "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Luxury Penthouse",
      location: "Victoria Island, Lagos",
      price: "$3,800/month",
      image:
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    },
    {
      id: 4,
      title: "Cozy Family Apartment",
      location: "Lekki Phase 1",
      price: "$1,500/month",
      image: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800",
    },
  ],
  reviews: [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      date: "June 15, 2026",
      comment:
        "The apartment exceeded my expectations. Clean, secure, and exactly as advertised.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 2,
      name: "David Williams",
      rating: 4,
      date: "May 28, 2026",
      comment:
        "Great location and friendly landlord. The inspection process was smooth.",
      avatar: "https://randomuser.me/api/portraits/men/52.jpg",
    },
    {
      id: 3,
      name: "Mary Brown",
      rating: 5,
      date: "April 10, 2026",
      comment:
        "One of the best rental experiences I've had. Highly recommended.",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
  ],
};

export default property;
