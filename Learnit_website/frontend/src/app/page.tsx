'use client'
import Image from "next/image";
import PDFQuizGenerator from "./pdfquizgenerator/page";
import DocumentHistorySidebar from "./pdfquizgenerator/recentDocuments/RecentDocument";
import { useEffect, useState } from "react";

export default function Home() {
  // State to track if the screen is mobile/short
  const [isMobileView, setIsMobileView] = useState(false);

  // Handler for document selection
  const handleDocumentSelect = (documentId: any) => {
    console.log(`Selected document: ${documentId}`);
    // Add your document selection logic here
  };

  // Effect to handle screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      // You can adjust these values based on your definition of mobile/short screen
      setIsMobileView(window.innerWidth < 768 || window.innerHeight < 600);
    };

    // Check on initial load
    checkScreenSize();

    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);

    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
      <>
        <PDFQuizGenerator />
      </>
  );
}