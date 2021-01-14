import { useRef, useState } from "react";
import { useGesture } from "react-use-gesture";

export default function Home() {
  return (
    <>
      <p className="mt-2 text-center">Image Cropper</p>

      <div className="p-8">
        <ImageCropper src="http://i3.ytimg.com/vi/bNDCFBIiAe8/maxresdefault.jpg" />
      </div>
    </>
  );
}

function ImageCropper({ src }) {
  let [crop, setCrop] = useState({ x: 0, y: 0, scale: 1 });
  let imageRef = useRef();
  let imageContainerRef = useRef();
  useGesture(
    {
      onDrag: ({ movement: [dx, dy] }) => {
        setCrop((crop) => ({ ...crop, x: Math.round(dx), y: Math.round(dy) }));
      },

      onPinch: ({ offset: [d] }) => {
        setCrop((crop) => ({ ...crop, scale: 1 + d / 50 }));
      },

      onDragEnd: maybeReadjustImage,
      onPinchEnd: maybeReadjustImage,
    },
    {
      drag: {
        initial: () => [crop.x, crop.y],
      },
      pinch: {
        distanceBounds: { min: 0 },
      },
      domTarget: imageRef,
      eventOptions: { passive: false },
    }
  );

  function maybeReadjustImage() {
    let newCrop = crop;
    let imageBounds = imageRef.current.getBoundingClientRect();
    let containerBounds = imageContainerRef.current.getBoundingClientRect();
    let originalWidth = imageRef.current.clientWidth;
    let originalHeight = imageRef.current.clientHeight;
    let leftEdge = (imageBounds.width - originalWidth) / 2;
    let topEdge = (imageBounds.height - originalHeight) / 2;

    if (imageBounds.left > containerBounds.left) {
      newCrop.x = Math.round(leftEdge);
    } else if (imageBounds.right < containerBounds.right) {
      newCrop.x = Math.round(
        containerBounds.width - imageBounds.width + leftEdge
      );
    }

    if (imageBounds.top > containerBounds.top) {
      newCrop.y = Math.round(topEdge);
    } else if (imageBounds.bottom < containerBounds.bottom) {
      newCrop.y = Math.round(
        containerBounds.height - imageBounds.height + topEdge
      );
    }

    setCrop(newCrop);
  }

  return (
    <>
      <div className="overflow-hidden ring-4 ring-blue-500 aspect-w-3 aspect-h-4">
        <div ref={imageContainerRef}>
          <img
            src={src}
            ref={imageRef}
            style={{
              left: crop.x,
              top: crop.y,
              transform: `scale(${crop.scale})`,
              touchAction: "none",
            }}
            className="relative w-auto h-full max-w-none max-h-none"
          />
        </div>
      </div>
      <div className="mt-2">
        <p>Crop X: {crop.x}</p>
        <p>Crop Y: {crop.y}</p>
        <p>Crop Scale: {crop.scale}</p>
      </div>
    </>
  );
}
