import React, { useState, useRef, useEffect } from "react";
import { ResizableBox } from "react-resizable";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";
import { Document, Page, pdfjs } from "react-pdf";
import Draggable from "react-draggable";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import download from "downloadjs";

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
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [file, setFile] = useState(null);
  const [signatureImage, setSignatureImage] = useState("");
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
  const [signatureSize, setSignatureSize] = useState({ width: 200, height: 100 });
  const [signedPdfUrl, setSignedPdfUrl] = useState(null);

  const canvasRef = useRef(null);
  const pdfContainerRef = useRef(null);

  useEffect(() => {
    const container = pdfContainerRef.current;
    if (container) {
      const handleResize = () => {
        const containerRect = container.getBoundingClientRect();
        const maxX = containerRect.width - signatureSize.width;
        const maxY = containerRect.height - signatureSize.height;

        setSignaturePosition((prevPosition) => {
          const adjustedX = Math.min(prevPosition.x, maxX);
          const adjustedY = Math.min(prevPosition.y, maxY);
          return { x: adjustedX, y: adjustedY };
        });
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [signatureSize]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile); // Store the selected file in the state
    } else {
      alert("Please select a PDF file.");
    }
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handleClear = () => {
    canvasRef.current.clear();
  };

  const handleAdd = () => {
    const canvas = canvasRef.current;
    const signature = canvas.toDataURL(); // Get the signature as a data URL
    setSignatureImage(signature);
    handleClose();
    setSignedPdfUrl(true);
  };

  const handleDownload = async () => {
    try {
      const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
      const pages = pdfDoc.getPages();

      const image = await pdfDoc.embedPng(signatureImage);
      const { width, height } = image.scale(0.75);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const container = pdfContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const pageHeight = containerRect.height / numPages;
        const pageSignaturePosition = {
          x: signaturePosition.x + 10,
          y:
            page.getHeight() -
            signaturePosition.y -
            height +
            46 +
            pageHeight * i,
        };

        page.drawImage(image, {
          x: pageSignaturePosition.x,
          y: pageSignaturePosition.y,
          width,
          height,
        });
      }

      const modifiedPdfBytes = await pdfDoc.save();
      download(modifiedPdfBytes, "modified.pdf", "application/pdf");
    } catch (error) {
      console.error("Error modifying and downloading PDF:", error);
    }
  };

  const handleDrag = (e, draggableData) => {
    const { x, y } = draggableData;
    const container = pdfContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const signatureRect = e.target.getBoundingClientRect();

    const minX = containerRect.left - 90;
    const maxX =
      containerRect.left + containerRect.width - signatureRect.width + 30;
    const minY = containerRect.top - 50;

    const pageHeight = containerRect.height / numPages; // Calculate the height of each page
    const maxY =
      containerRect.top +
      containerRect.height -
      signatureRect.height +
      pageHeight * (numPages - 1) +
      300; // Adjust maxY based on the number of pages

    let adjustedX = x;
    let adjustedY = y;

    if (x < minX) {
      adjustedX = minX;
    } else if (x > maxX) {
      adjustedX = maxX;
    }

    if (y < minY) {
      adjustedY = minY;
    } else if (y > maxY) {
      adjustedY = maxY;
    }

    setSignaturePosition({ x: adjustedX, y: adjustedY });
  };

  const handleResize = (e, { size }) => {
    setSignatureSize(size);
  };
  

  return (
    <div>
      <input type="file" accept=".pdf" onChange={onFileChange} />
      {file && (
        <div>
          <div
            ref={pdfContainerRef}
            className="pdf-container relative border-2 border-black p-2 m-1 w-min"
          >
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={700}
                />
              ))}
            </Document>
            {signatureImage && (
      <div className="absolute top-0">
        <Draggable
          position={{ x: signaturePosition.x, y: signaturePosition.y }}
          onDrag={handleDrag}
        >
          <div style={{ width: signatureSize.width, height: signatureSize.height }}>
            <ResizableBox
               width={400} height={300} onResize={handleResize}
            >
              <img src={signatureImage}  alt="Signature" />
            </ResizableBox>
          </div>
        </Draggable>
      </div>
    )}
          </div>
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
                  <SignatureCanvas
                    penColor="black"
                    canvasProps={{
                      width: 300,
                      height: 200,
                      className: "sigCanvas",
                    }}
                    ref={canvasRef}
                  />
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
            {signedPdfUrl && (
              <button onClick={handleDownload}>Download</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
