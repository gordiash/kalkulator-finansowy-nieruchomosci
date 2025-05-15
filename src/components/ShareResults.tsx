import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface ShareResultsProps {
  results: any;
  calculatorType: 'roi' | 'investment' | 'rental-value' | string;
}

const ShareResults: React.FC<ShareResultsProps> = ({ results, calculatorType }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const generateShareableLink = () => {
    // Konwertujemy dane do formatu base64, aby uniknąć problemów ze znakami specjalnymi
    const encodedData = btoa(JSON.stringify(results));
    let path = '';
    if (calculatorType === 'roi') path = 'kalkulator-roi';
    else if (calculatorType === 'investment') path = 'kalkulator-inwestycji';
    else if (calculatorType === 'rental-value') path = 'kalkulator-wartosci-najmu';
    else path = calculatorType;
    return `${window.location.origin}/${path}?data=${encodedData}`;
  };

  const copyToClipboard = async () => {
    try {
      const shareableLink = generateShareableLink();
      await navigator.clipboard.writeText(shareableLink);
      setIsCopied(true);
      toast.success('Link skopiowany do schowka!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Nie udało się skopiować linku');
    }
  };

  const shareOnSocialMedia = (platform: string) => {
    const shareableLink = generateShareableLink();
    const text = 'Sprawdź wyniki mojej analizy inwestycyjnej:';
    
    let url = '';
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareableLink)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareableLink)}`;
        break;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setShowShareModal(true)}
        className="w-full md:w-auto px-4 py-2 bg-brand-blue text-white rounded hover:bg-brand-darkblue transition-colors duration-300 flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span>Udostępnij wyniki</span>
      </button>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Udostępnij wyniki</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded">
                <input
                  type="text"
                  readOnly
                  value={generateShareableLink()}
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-3 py-1 rounded ${
                    isCopied ? 'bg-green-500 text-white' : 'bg-brand-blue text-white'
                  }`}
                >
                  {isCopied ? 'Skopiowano!' : 'Kopiuj'}
                </button>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => shareOnSocialMedia('facebook')}
                  className="p-2 bg-[#1877F2] text-white rounded-full hover:opacity-90"
                  aria-label="Udostępnij na Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </button>
                <button
                  onClick={() => shareOnSocialMedia('linkedin')}
                  className="p-2 bg-[#0A66C2] text-white rounded-full hover:opacity-90"
                  aria-label="Udostępnij na LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </button>
                <button
                  onClick={() => shareOnSocialMedia('twitter')}
                  className="p-2 bg-[#1DA1F2] text-white rounded-full hover:opacity-90"
                  aria-label="Udostępnij na Twitter"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareResults; 