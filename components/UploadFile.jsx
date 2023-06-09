import React, { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import SignatureCanvas from "react-signature-canvas";
import { PDFDocument } from "pdf-lib";
import { Document, Page, pdfjs } from "react-pdf";
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
  //used for to preview the file which is uploaded
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  //for downloading the signed file
  const [signedPdfUrl, setSignedPdfUrl] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

 //used to display the uploaded file
  const onFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      // File type not supported, handle accordingly
      alert('Please select a PDF file.');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  //used to clear the signature canvas area 
  const handleClear = () => {
    canvasRef.current.clear();
  };

  //used to add and preview the signatured on the file
  const handleAdd = async () => {
    if (!file) {
      // Handle case where file is not selected or loaded
      return;
    }

    // Get the signature data from the canvas
    const signatureData = canvasRef.current.toDataURL();

    // Load the PDF document
    const pdf = await PDFDocument.load(await file.arrayBuffer());

    // Embed the signature image as a new page in the PDF
    const signatureImage = await pdf.embedPng(signatureData);
    const pages = pdf.getPages();
    const firstPage = pages[0];

    // Calculate the coordinates for the signature placement
    const signatureWidth = 100; // Adjust as needed
    const signatureHeight = 50; // Adjust as needed
    const x = firstPage.getWidth() - signatureWidth - 10; // Adjust the margins as needed
    const y = firstPage.getHeight() - signatureHeight - 10; // Adjust the margins as needed

    // Draw the signature image on the first page
    firstPage.drawImage(signatureImage, {
      x: x,
      y: y,
      width: signatureWidth,
      height: signatureHeight,
    });

    // Generate a new PDF blob with the added signature
    const pdfBytes = await pdf.save();

    // Create a blob URL for the modified PDF
    const modifiedPdfUrl = URL.createObjectURL(
      new Blob([pdfBytes], { type: 'application/pdf' })
    );

    // Update the file state with the modified PDF
    setFile(modifiedPdfUrl);
    handleClose('true')
    setSignedPdfUrl(true)
  };


//used to download the the signed file
  const handleDownload = () => {
    if (!file) {
      // Handle case where file is not available
      return;
    }

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = file;
    link.download = 'modified_file.pdf';

    // Simulate a click on the link to trigger the download
    link.click();
  };

  return (
    <div>
      <input type="file"  accept=".pdf" onChange={onFileChange} />
      {file && (
        <div >
          <Document className="border-2 border-black p-2 m-1  w-[50%]" file={file} onLoadSuccess={onDocumentLoadSuccess}>
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={700}
              />
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
                  className=" p-2 border-black border-2 "
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
                  className=" flex justify-between "
                  id="modal-modal-description"
                  sx={{ mt: 2 }}
                >
                  <button
                    onClick={handleClear}
                    className=" py-2 px-3 bg-gray-600 text-white rounded "
                  >
                    Cancle
                  </button>
                  <button
                    onClick={handleAdd}
                    className=" py-2 px-3 bg-gray-600 text-white rounded "
                  >
                    Add
                  </button>
                </Typography>
              </Box>
            </Modal>
            {/* if the file is signed then display the download button otherwise not  */}
            {signedPdfUrl && <button onClick={handleDownload}>Download</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadFile;
