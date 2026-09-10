import { useState, useEffect } from "react";
import { motion } from "framer-motion";

function ImageGallery({ images = [], title }) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");

  useEffect(() => {
    setSelectedImage(images[0] || "");
  }, [images]);

  if (images.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5 }}
      className="bg-white py-12 transition-colors duration-300 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl shadow-lg dark:shadow-black/30"
        >
          <motion.img
            key={selectedImage}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            src={selectedImage}
            alt={title}
            className="h-[500px] w-full object-cover"
          />
        </motion.div>

        {/* Thumbnail Images */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {images.map((image, index) => (
            <motion.button
              key={index}
              type="button"
              onClick={() => setSelectedImage(image)}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 15,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                },
              }}
              whileHover={{
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.97,
              }}
              transition={{
                duration: 0.2,
              }}
              className={`overflow-hidden rounded-xl border-4 transition-all duration-300 ${
                selectedImage === image
                  ? "border-blue-600 shadow-md shadow-blue-600/20"
                  : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <motion.img
                src={image}
                alt={`${title} ${index + 1}`}
                className="h-28 w-full object-cover"
                whileHover={{
                  scale: 1.08,
                }}
                transition={{
                  duration: 0.3,
                }}
              />
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

export default ImageGallery;
