import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

export async function loadHtml() {
  const html = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    resources: 'usable',
    url: 'file://' + path.resolve(process.cwd(), 'index.html'),
    pretendToBeVisual: true,
  });

  // run entry point script after DOMContentLoaded event
  const scriptPath = path.resolve(process.cwd(), 'src/js/main.js');
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');

  return new Promise((resolve, reject) => {
    dom.window.addEventListener(
      'DOMContentLoaded',
      () => {
        try {
          dom.window.eval(scriptContent);

          //Replaces the global window and document objects with the ones from JSDOM
          Object.defineProperty(globalThis, 'window', { value: dom.window, configurable: true });
          Object.defineProperty(globalThis, 'document', {
            value: dom.window.document,
            configurable: true,
          });
          Object.defineProperty(globalThis, 'HTMLElement', {
            value: dom.window.HTMLElement,
            configurable: true,
          });
          Object.defineProperty(globalThis, 'Node', {
            value: dom.window.Node,
            configurable: true,
          });
          Object.defineProperty(globalThis, 'MouseEvent', {
            value: dom.window.MouseEvent,
            configurable: true,
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      },
      { once: true },
    );
  });
}
