import React, { useState } from 'react';
import Draggable from 'react-draggable';

const ImageSizeInc = () => {
  const [imageSize, setImageSize] = useState(50); // Initial size set to 50%

  const handleIncreaseSize = () => {
    setImageSize(imageSize + 10); // Increase size by 10%
  };

  const handleDecreaseSize = () => {
    setImageSize(imageSize - 10); // Decrease size by 10%
  };

  return (
    <div>
      <Draggable>
        <img
          src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
          alt=""
          style={{ width: `${imageSize}%` }}
        />
      </Draggable>
      <div>
        <button onClick={handleIncreaseSize}>Increase Size</button>
        <button onClick={handleDecreaseSize}>Decrease Size</button>
      </div>
    </div>
  );
}

export default ImageSizeInc;
