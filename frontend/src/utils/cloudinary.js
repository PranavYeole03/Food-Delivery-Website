export const optimizeCloudinaryUrl = (url, width = 300) => {
  if (!url || typeof url !== "string") return url;
  if (url.includes("res.cloudinary.com")) {
    // Replace "/upload/" with optimized version
    // f_auto: auto format, q_auto: auto quality, w_<width>: resize, c_fill: fill crop
    return url.replace("/upload/", `/upload/w_${width},c_fill,f_auto,q_auto/`);
  }
  return url;
};
