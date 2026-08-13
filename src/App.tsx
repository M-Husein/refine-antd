import { useState, useId, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';

export const App = () => {
  const myId = useId();
  const [count, setCount] = useState(0);

  useToggleSplashScreen();

  return (
    <>
      <header
        className="sticky top-0 z-1 bg-blue-100 shadow py-2 px-4 text-center"
      >
        <a href="/" translate="no">
          <img src={viteLogo} className="logo" width={33} alt={import.meta.env.VITE_APP_NAME} />
        </a>
      </header>

      <main className="p-4">
        <section className="text-center">
          <a href="https://vite.dev" target="_blank" rel="noopener noreferrer">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>

          <h1>Vite + React</h1>
          
          <button 
            id={myId}
            type="button"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
          <hr />
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
          <p className="read-the-docs">
            Click on the Vite and React logos to learn more
          </p>
        </section>

        <hr />

        <h2>
          Based on
          {' '}
          <a 
            href="https://getbootstrap.com/docs/5.3/content/typography"
            target="_blank" 
            rel="noopener noreferrer"
          >
            Bootstrap Typography
          </a>
        </h2>
        
        {/* Heading classes – include weight & line-height */}
        <section>
          <h1>h1. Bootstrap heading</h1>
          <h2>h2. Bootstrap heading</h2>
          <h3>h3. Bootstrap heading</h3>
          <h4>h4. Bootstrap heading</h4>
          <h5>h5. Bootstrap heading</h5>
          <h6>h6. Bootstrap heading</h6>
        </section>

        <hr />

        <p className="h1">h1. Bootstrap heading</p>
        <p className="h2">h2. Bootstrap heading</p>
        <p className="h3">h3. Bootstrap heading</p>
        <p className="h4">h4. Bootstrap heading</p>
        <p className="h5">h5. Bootstrap heading</p>
        <p className="h6">h6. Bootstrap heading</p>

        <hr />

        <h2>Customizing headings</h2>
        <section>
          <h3>
            Fancy display heading{' '}
            <small className="text-gray-600">With faded secondary text</small>
          </h3>
        </section>
        
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
        <section>
          <h1 className="display-1">Display 1</h1>
          <h1 className="display-2">Display 2</h1>
          <h1 className="display-3">Display 3</h1>
          <h1 className="display-4">Display 4</h1>
          <h1 className="display-5">Display 5</h1>
          <h1 className="display-6">Display 6</h1>
        </section>

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

const useToggleSplashScreen = (hide: boolean = true) => {
  useEffect(() => {
    const loaderApp = document.getElementById('loaderApp');
    if(loaderApp) loaderApp.hidden = hide;
  }, []);
}
