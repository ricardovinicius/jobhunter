import { Window } from 'happy-dom';

const window = new Window();
const document = window.document;

// @ts-ignore
global.window = window;
// @ts-ignore
global.document = document;
// @ts-ignore
global.navigator = window.navigator;
// @ts-ignore
global.HTMLElement = window.HTMLElement;
