"use client";
import React, { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage"; 
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Button,
} from "@mui/material";

type CropDialogProps = {
  file: File | null;
  onClose: () => void;
  onSave: (file: File) => void;
};

export const CropDialog: React.FC<CropDialogProps> = ({
  file,
  onClose,
  onSave,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!file || !croppedAreaPixels) return;
    const croppedFile = await getCroppedImg(file, croppedAreaPixels);
    onSave(croppedFile);
    onClose();
  };

  return (
    <Dialog
      open={!!file}
      onClose={onClose}
      fullWidth
      sx={{ maxWidth: "448px", mx: "auto" }}
    >
      <h3 className="font-raleway font-inter text-[18px] font-medium px-4 py-2">
        Edit Profile Picture
      </h3>
      <DialogContent
        dividers
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <div className="relative w-full h-[300px] rounded-md overflow-hidden bg-[#000]/10">
          {file && (
            <Cropper
              image={URL.createObjectURL(file)}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                mediaStyle: {
                  maxWidth: "none",
                  maxHeight: "none",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                },
              }}
            />
          )}
        </div>
        <Slider
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          onChange={(_, value) => setZoom(value as number)}
          sx={{
            mt: 3,
            width: "80%",
            color: "gray", // makes the track/rail gray
            "& .MuiSlider-thumb": {
              backgroundColor: "#f1437e",
            },
            "& .MuiSlider-rail": {
              backgroundColor: "#d3d3d3", // lighter gray for background
            },
            "& .MuiSlider-track": {
              backgroundColor: "gray", // darker gray for filled part
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ paddingX: "16px" }}>
        <button
          onClick={onClose}
          className="font-raleway bg-[#fff] py-1 px-3 rounded-sm text-[#000] cursor-pointer "
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          // variant="contained"
          // sx={{ bgcolor: "#f1437e" }}
          className="font-raleway bg-[#f1437e] py-1 px-3 rounded-sm text-[#fff] cursor-pointer "
        >
          Save
        </button>
      </DialogActions>
    </Dialog>
  );
};
