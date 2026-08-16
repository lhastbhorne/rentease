import { useState, useEffect } from "react";

function ImageGallery({ images = [], title }) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");

  useEffect(() => {
    setSelectedImage(images[0] || "");
  }, [images]);

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* Featured Image */}

        <div className="overflow-hidden rounded-3xl shadow-lg">
          <img
            src={selectedImage}
            alt={title}
            className="h-[500px] w-full object-cover"
          />
        </div>

        {/* Thumbnail Images */}

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(image)}
              className={`overflow-hidden rounded-xl border-4 transition

                ${
                  selectedImage === image
                    ? "border-blue-600"
                    : "border-transparent"
                }
              `}
            >
              <img
                src={image}
                alt={`${title} ${index + 1}`}
                className="h-28 w-full object-cover transition hover:scale-105"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ImageGallery;
