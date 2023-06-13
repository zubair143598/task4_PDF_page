import React from 'react';
import { ResizableBox } from 'react-resizable';
import { Draggable } from 'react-draggable';


const ResizableImage = () => {
  const handleResize = (event, { size }) => {
    // Handle the resize event here if needed
  };

  return (
    <div>
      <Draggable>
        <ResizableBox width={400} height={300} onResize={handleResize}>
          <img
            src="https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
            alt=""
            style={{ width: '100%', height: '100%' }}
          />
        </ResizableBox>
      </Draggable>
    </div>
  );
};

export default ResizableImage;
