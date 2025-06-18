import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Contract {
  eventName: string;
  eventDate: string;
  artistName: string;
  fee: number;
  clauses: string[];
}

export const generateContractPdf = async (contract: Contract): Promise<Blob> => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const margin = 40;
  let yOffset = margin;

  // Add title
  doc.setFontSize(20);
  doc.text('Performance Contract', margin, yOffset);
  yOffset += 30;

  // Add contract details
  doc.setFontSize(12);
  doc.text(`Event Name: ${contract.eventName}`, margin, yOffset);
  yOffset += 20;
  doc.text(`Event Date: ${contract.eventDate}`, margin, yOffset);
  yOffset += 20;
  doc.text(`Artist Name: ${contract.artistName}`, margin, yOffset);
  yOffset += 20;
  doc.text(`Fee: ${contract.fee}`, margin, yOffset);
  yOffset += 30;

  // Add clauses
  doc.setFontSize(14);
  doc.text('Clauses:', margin, yOffset);
  yOffset += 20;

  doc.setFontSize(12);
  contract.clauses.forEach((clause, index) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${clause}`, doc.internal.pageSize.getWidth() - 2 * margin);
    doc.text(lines, margin, yOffset);
    yOffset += (lines.length * 15) + 10; // Adjust spacing based on number of lines
  });

  // This is a basic example. For more complex styling and layout,
  // consider rendering the content to an HTML element and using html2canvas.

  // Example of using html2canvas (optional, for more complex layouts)
  // const contractContent = document.createElement('div');
  // contractContent.innerHTML = `
  //   <h1>Performance Contract</h1>
  //   <p><strong>Event Name:</strong> ${contract.eventName}</p>
  //   <p><strong>Event Date:</strong> ${contract.eventDate}</p>
  //   <p><strong>Artist Name:</strong> ${contract.artistName}</p>
  //   <p><strong>Fee:</strong> ${contract.fee}</p>
  //   <h2>Clauses:</h2>
  //   <ul>
  //     ${contract.clauses.map((clause, index) => `<li>${index + 1}. ${clause}</li>`).join('')}
  //   </ul>
  // `;
  // document.body.appendChild(contractContent); // Temporarily add to DOM

  // const canvas = await html2canvas(contractContent);
  // const imgData = canvas.toDataURL('image/png');
  // doc.addImage(imgData, 'PNG', margin, yOffset, canvas.width * 0.5, canvas.height * 0.5);
  // document.body.removeChild(contractContent); // Remove from DOM

  return new Promise((resolve) => {
    const blob = doc.output('blob');
    resolve(blob);
  });
};