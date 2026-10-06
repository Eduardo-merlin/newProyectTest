import { beforeEach, describe, expect, it } from 'vitest';
import { loadHtml } from './loadHtml';

describe('Index Page unit tests', () => {
  beforeEach(async () => {
    //loads current index.html file into the document body before each test
    await loadHtml();
  });

  //Basic tests
  it("Should render page's title", () => {
    //We can use querySelector to find any elemen
    const title = document.querySelector('.title');
    //assert to not be null
    expect(title).not.toBeNull();
    //assert to have the correct text content and class
    expect(title.textContent).toBe('MVC Laboratory');
    expect(title.classList.contains('title')).toBe(true);
  });

  it('Should render a button with the correct text', () => {
    const button = document.querySelector('#btn');
    expect(button).not.toBeNull();
    expect(button.textContent).toBe('Haz clic');
  });

  it('Should change button text after clicking it', () => {
    const button = document.querySelector('#btn');
    expect(button).not.toBeNull();
    //Simulate a click event on the button
    button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    //Assert that the button text has changed
    expect(button.textContent).toBe('¡Gracias!');
  });
});
