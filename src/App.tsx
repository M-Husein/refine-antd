import { useState, useId, useEffect } from 'react';
// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
import { Placeholder } from '@/components/Placeholder';

// const oneToSix = [1, 2, 3, 4, 5, 6];

const useToggleSplashScreen = (hide: boolean = true) => {
  useEffect(() => {
    const loaderApp = document.getElementById('loaderApp');
    if(loaderApp) loaderApp.hidden = hide;
  }, []);
};

export const App = () => {
  const myId = useId();
  const [count, setCount] = useState(0);

  useToggleSplashScreen();

  return (
    <>
      <header
        className="sticky top-0 z-1 bg-blue-100 shadow py-2 px-4 text-center"
      >
        <strong translate="no">
          <Placeholder
            text="VK"
            title={import.meta.env.VITE_APP_NAME}
            className="rounded"
            // dy=".1em"
            style={{
              width: 33,
              height: 33,
              fontSize: 15,
            }}
          />
        </strong>
      </header>

      <main className="p-4">
        <button 
          id={myId}
          type="button"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>

        <hr />
        
        {/* Heading classes – include weight & line-height */}
        <h1>h1. Bootstrap heading</h1>
        <h2>h2. Bootstrap heading</h2>
        <h3>h3. Bootstrap heading</h3>
        <h4>h4. Bootstrap heading</h4>
        <h5>h5. Bootstrap heading</h5>
        <h6>h6. Bootstrap heading</h6>

        <hr />

        <p className="h1">h1. Bootstrap heading</p>
        <p className="h2">h2. Bootstrap heading</p>
        <p className="h3">h3. Bootstrap heading</p>
        <p className="h4">h4. Bootstrap heading</p>
        <p className="h5">h5. Bootstrap heading</p>
        <p className="h6">h6. Bootstrap heading</p>

        <hr />

        <h2>Customizing headings</h2>
        <h3>
          Fancy display heading{' '}
          <small className="text-gray-600">With faded secondary text</small>
        </h3>
        
        <hr />
        
        {/* Font size utilities – font-size only */}
        <p className="fs-1">.fs-1 text</p>
        <p className="fs-2">.fs-2 text</p>
        <p className="fs-3">.fs-3 text</p>
        <p className="fs-4">.fs-4 text</p>
        <p className="fs-5">.fs-5 text</p>
        <p className="fs-6">.fs-6 text</p>

        <hr />

        <h2>Display headings</h2>
        <h1 className="display-1">Display 1</h1>
        <h1 className="display-2">Display 2</h1>
        <h1 className="display-3">Display 3</h1>
        <h1 className="display-4">Display 4</h1>
        <h1 className="display-5">Display 5</h1>
        <h1 className="display-6">Display 6</h1>

        <hr />

        <h2>Lead</h2>
        <p className="lead">
          This is a lead paragraph. It stands out from regular paragraphs.
        </p>

        <hr />

        <h2>Reset color</h2>
        <p className="text-gray-600">
          Secondary body text with a <a href="#" className="text-reset">reset link</a>.
        </p>
      </main>
    </>
  )
}

/*
<>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src={viteLogo} className="logo" alt="Vite logo" />
    </a>
    <a href="https://react.dev" target="_blank">
      <img src={reactLogo} className="logo react" alt="React logo" />
    </a>
  </div>
  <h1>Vite + React</h1>
  <div className="card">
    <button 
      id={myId}
      onClick={() => setCount((count) => count + 1)}
    >
      count is {count}
    </button>
    <p>
      Edit <code>src/App.tsx</code> and save to test HMR
    </p>
  </div>
  <p className="read-the-docs">
    Click on the Vite and React logos to learn more
  </p>
</>
*/
