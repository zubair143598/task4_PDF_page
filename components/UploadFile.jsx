import React, { useState,useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";


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

const UploadFile = () => {
  
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [open, setOpen] = useState(false);
  const canvasRef = useRef(null);

  

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


  const handlefile = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      alert("please select PDF file");
    }
  };
  const handleClear = () => {
    canvasRef.current.clear()
    
  };

  const handleAdd = async () => {
    const signatureImage = canvasRef.current.getTrimmedCanvas().toDataURL();

    try {
      const existingPdfBytes = await fetch(selectedFile).then((res) =>
        res.arrayBuffer()
      );
      const pdfDoc = await PDFDocument.load(existingPdfBytes);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      const { width, height } = firstPage.getSize();
      const signatureImageBytes = await fetch(signatureImage).then((res) =>
        res.arrayBuffer()
      );
      const signatureImageEmbed = await pdfDoc.embedPng(signatureImageBytes);

      firstPage.drawImage(signatureImageEmbed, {
        x: width / 2 - 100,
        y: height / 2 - 50,
        width: 200,
        height: 100,
      });

      const modifiedPdfBytes = await pdfDoc.save();

      const modifiedPdfUrl = URL.createObjectURL(
        new Blob([modifiedPdfBytes], { type: "application/pdf" })
      );

      // Download the modified PDF
      const link = document.createElement("a");
      link.href = modifiedPdfUrl;
      link.download = "signed_pdf.pdf";
      link.click();

      // Reset the canvas and close the modal
      canvasRef.current.clear();
      setOpen(false);
    } catch (error) {
      console.log("Error adding signature to PDF:", error);
    }
  };

  

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handlefile} />
      {selectedFile && (
        <div>
          <iframe
            src={selectedFile}
            title="PDF file"
            className=" relative w-[60%] h-[90vh]  "
          ></iframe>
          <div>
            <Button onClick={handleOpen}>Sign</Button>
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
                <Typography
                  className=" p-2 border-black border-2 "
                  id="modal-modal-title"
                  variant="h6"
                  component="h2"
                >
                  <SignatureCanvas
                    penColor="black"
                    canvasProps={{
                      width: 500,
                      height: 200,
                      className: "sigCanvas",
                    }}
                    ref={canvasRef}
                  />
                </Typography>
                <Typography
                  className=" flex justify-between "
                  id="modal-modal-description"
                  sx={{ mt: 2 }}
                >
                  <button onClick={handleClear} className=" py-2 px-3 bg-gray-600 text-white rounded ">
                    Cancle
                  </button>
                  <button onClick={handleAdd} className=" py-2 px-3 bg-gray-600 text-white rounded ">
                    Add
                  </button>
                </Typography>
              </Box>
            </Modal>
           
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
