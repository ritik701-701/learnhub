import { useRef } from 'react';

const Certificate = ({ userName, courseName, date }) => {
  const certRef = useRef(null);

  const handleDownload = () => {
    // In a real production app, we would use html2canvas or jsPDF here
    // For now, we simulate a simple print/save to PDF via browser
    window.print();
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <div 
        ref={certRef}
        className="relative w-full max-w-4xl p-10 bg-white border-8 border-double border-indigo-900 shadow-2xl text-center"
        style={{ aspectRatio: '1.414/1' }} // Standard certificate ratio
      >
        <div className="absolute inset-0 m-4 border border-indigo-200"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <h1 className="text-5xl font-serif text-indigo-900 mb-2">Certificate of Completion</h1>
          <p className="text-xl text-gray-600 mb-8 font-serif">This is to certify that</p>
          <h2 className="text-4xl font-bold text-gray-800 mb-6 border-b-2 border-gray-300 pb-2 px-10">{userName}</h2>
          <p className="text-lg text-gray-600 mb-6 font-serif">has successfully completed the course</p>
          <h3 className="text-3xl font-bold text-indigo-700 mb-10">{courseName}</h3>
          
          <div className="flex justify-between w-full px-20 mt-10">
            <div className="text-center">
              <p className="border-b border-gray-400 w-32 pb-1 mb-1 font-semibold">{date}</p>
              <p className="text-sm text-gray-500 uppercase tracking-wider">Date</p>
            </div>
            <div className="text-center">
              <p className="border-b border-gray-400 w-32 pb-1 mb-1 font-signature text-xl">E-LearnHub</p>
              <p className="text-sm text-gray-500 uppercase tracking-wider">Platform</p>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleDownload}
        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 print:hidden"
      >
        Download Certificate
      </button>
    </div>
  );
};

export default Certificate;
