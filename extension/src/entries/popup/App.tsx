import { useState } from 'react';
import './App.css';

function App() {
  const [link, setLink] = useState('');
  const [showInput, setShowInput] = useState(false);

  return (
    <div className="w-72 p-2 rounded-md">
      <div className="flex flex-col items-center space-y-1">
        <h3 className="whitespace-nowrap text-4xl font-bold leading-none tracking-tight text-center">
          <span role="img" aria-label="bookmark" className="mr-2">
            🔖
          </span>
          Linkeep
        </h3>
      </div>
      <div className="p-2">
        <div className="flex flex-col items-center gap-2">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Save this page or a link for later.
          </p>
          <div className="flex flex-col items-center gap-1 w-full">
            <button
              className="bg-gray-200 text-black inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full hover:bg-gray-300"
              onClick={() => setShowInput(!showInput)}
            >
              <span role="img" aria-label="link" className="mr-2">
                🔗
              </span>
              {showInput ? 'Save Page' : 'Save a Link.'}
            </button>
            {showInput && (
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            )}
            <button className="bg-black text-white inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full hover:bg-gray-800">
              <span role="img" aria-label="save" className="mr-2">
                💾
              </span>
              Save {showInput ? 'this link.' : 'this page.'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
