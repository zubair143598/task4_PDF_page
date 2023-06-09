import React from 'react';
import Draggable from 'react-draggable';

const Drag = () => {
  const handleDrag = (e, { x, y }) => {
    // Handle the drag event here if needed
    // You can access the new position using the x and y coordinates
  };

  return (
    <Draggable
      defaultPosition={{ x: 30, y: 50 }} // Initial position
      onDrag={handleDrag} // Event handler for drag events
    >
      <div>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/3c/IMG_logo_%282017%29.svg"
          className='w-[300px] absolute'
          alt=""
        />
      </div>
    </Draggable>
  );
};

export default Drag;