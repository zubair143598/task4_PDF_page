import React, { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";
import { Document, Page, pdfjs } from "react-pdf";
import Draggable from "react-draggable";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

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
  const [open, setOpen] = useState(false);
  const canvasRef = useRef(null);
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [signedPdfUrl, setSignedPdfUrl] = useState(null);
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please select a PDF file.");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleClear = () => {
    canvasRef.current.clear();
  };

  const handleDrag = (e, ui) => {
    const { x, y } = ui;
    const canvas = canvasRef.current;
    const canvasRect = canvas.getBoundingClientRect();
    const signatureX = x - canvasRect.left;
    const signatureY = y - canvasRect.top;
    setSignaturePosition({ x: signatureX, y: signatureY });
  };

  const handleAdd = async () => {
    if (!file) {
      alert("File is not selected");
      return;
    }

    const canvas = canvasRef.current;
const signatureData = canvas.getTrimmedCanvas().toDataURL();

    const pdf = await PDFDocument.load(await file.arrayBuffer());

    const signatureImage = await pdf.embedPng(signatureData);
    const pages = pdf.getPages();
    const firstPage = pages[0];

    const signatureWidth = 100;
    const signatureHeight = 50;
    const x = signaturePosition.x;
    const y = signaturePosition.y;

    firstPage.drawImage(signatureImage, {
      x: x,
      y: y,
      width: signatureWidth,
      height: signatureHeight,
    });

    const pdfBytes = await pdf.save();

    const modifiedPdfUrl = URL.createObjectURL(
      new Blob([pdfBytes], { type: "application/pdf" })
    );

    setFile(modifiedPdfUrl);
    handleClose();
    setSignedPdfUrl(true);
  };

  const handleDownload = () => {
    if (!file) {
      alert("File is not available");
      return;
    }

    const link = document.createElement("a");
    link.href = file;
    link.download = "modified_file.pdf";
    link.click();
  };
  

  return (
    <div>
      <input type="file" accept=".pdf" onChange={onFileChange} />
      {file && (
        <div>
          <Document
            className="border-2 border-black p-2 m-1 w-[50%]"
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page key={`page_${index + 1}`} pageNumber={index + 1} width={700} />
            ))}
          </Document>
          <div>
            <Button onClick={handleOpen}>Sign</Button>
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style} className="">
                <Typography
                  className="p-2 border-black border-2"
                  id="modal-modal-title"
                  variant="h6"
                  component="h2"
                >
                <Draggable
  onDrag={handleDrag}
  bounds="parent"
  position={signaturePosition}
>
  <SignatureCanvas
    penColor="black"
    canvasProps={{
      width: 300,
      height: 200,
      className: "sigCanvas",
    }}
    ref={canvasRef}
  />
</Draggable>
                </Typography>
                <Typography
                  className="flex justify-between"
                  id="modal-modal-description"
                  sx={{ mt: 2 }}
                >
                  <button
                    onClick={handleClear}
                    className="py-2 px-3 bg-gray-600 text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="py-2 px-3 bg-gray-600 text-white rounded"
                  >
                    Add
                  </button>
                </Typography>
              </Box>
            </Modal>
            {signedPdfUrl && <button onClick={handleDownload}>Download</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
