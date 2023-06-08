

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import SignatureCanvas from "react-signature-canvas";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};
const BasicModal = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography className=" p-2 border-black border-2 " id="modal-modal-title" variant="h6" component="h2">
            <SignatureCanvas
              penColor="green"
              canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
            />
            
          </Typography>
          <Typography className=" flex justify-between " id="modal-modal-description" sx={{ mt: 2 }}>
            <button className=" py-2 px-3 bg-gray-600 text-white rounded ">Cancle</button>
            <button className=" py-2 px-3 bg-gray-600 text-white rounded ">Add</button>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
};
export default BasicModal;

