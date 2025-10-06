export const getCroppedImg = (file: File, croppedAreaPixels: any): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    image.src = URL.createObjectURL(file);
    image.onload = () => {
      const { x, y, width, height } = croppedAreaPixels;
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(image, x, y, width, height, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Canvas is empty"));
        const croppedFile = new File([blob], file.name, { type: file.type });
        resolve(croppedFile);
      }, file.type);
    };

    image.onerror = (err) => reject(err);
  });
};
