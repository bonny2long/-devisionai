import { useState, useEffect } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ soapNote: '', patientSummary: '' });
  const [copied, setCopied] = useState({ soap: false, summary: false });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleSubmit = async () => {
    if (!file) return alert('Please upload a file first');

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(res.data);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Something went wrong — check the console.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTextFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 py-10 flex flex-col justify-between">
      <Helmet>
        <title>DevisionAI – Instant SOAP Notes from Transcripts</title>
        <meta name="description" content="DevisionAI converts patient visit transcripts into SOAP notes and summaries using secure AI." />
        <meta name="keywords" content="DevisionAI, SOAP note generator, clinical documentation AI, healthcare transcript tool" />
        <meta name="author" content="Bonny Makaniankhondo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>

      {/* Toggle */}
      <div className="absolute top-4 right-4">
        <button
          aria-label="Toggle Dark Mode"
          onClick={() => setDarkMode(!darkMode)}
          className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1 rounded"
        >
          {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">DevisionAI</h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Turn Conversations into Clinical Documentation – Instantly.
          </p>
        </header>

        {/* Upload Section */}
        <section
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4"
          aria-label="File upload section"
        >
          <label htmlFor="fileUpload" className="block font-medium">
            Upload Transcript (.txt)
          </label>
          <input
            id="fileUpload"
            type="file"
            accept=".txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="border border-gray-300 p-2 rounded w-full"
            aria-label="Upload .txt file"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            aria-label="Submit file to generate notes"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Generating…' : 'Generate Notes'}
          </button>
        </section>

        {/* Output Section */}
        {results.soapNote && (
          <section
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6"
            aria-label="Generated Results"
          >
            {/* SOAP Note */}
            <div>
              <h2 className="text-xl font-semibold mb-2">🧾 SOAP Note</h2>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(results.soapNote);
                    setCopied({ ...copied, soap: true });
                    setTimeout(() => setCopied({ ...copied, soap: false }), 2000);
                  }}
                  aria-label="Copy SOAP note"
                  className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1 rounded"
                >
                  {copied.soap ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => downloadTextFile('soap-note.txt', results.soapNote)}
                  aria-label="Download SOAP note"
                  className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1 rounded"
                >
                  Download
                </button>
              </div>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded whitespace-pre-wrap">{results.soapNote}</pre>
            </div>

            {/* Patient Summary */}
            <div>
              <h2 className="text-xl font-semibold mb-2">📋 Patient Summary</h2>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(results.patientSummary);
                    setCopied({ ...copied, summary: true });
                    setTimeout(() => setCopied({ ...copied, summary: false }), 2000);
                  }}
                  aria-label="Copy patient summary"
                  className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1 rounded"
                >
                  {copied.summary ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => downloadTextFile('patient-summary.txt', results.patientSummary)}
                  aria-label="Download patient summary"
                  className="text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1 rounded"
                >
                  Download
                </button>
              </div>
              <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded whitespace-pre-wrap">
                {results.patientSummary}
              </pre>
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-400 dark:text-gray-500 text-sm" aria-label="Footer">
        © {new Date().getFullYear()} DevisionAI. Built with love by Bonny Makaniankhondo.
      </footer>
    </div>
  );
}

export default App;
