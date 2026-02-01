import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Waits for an element to appear in the DOM for a specified amount of time.
 * @param selector The CSS selector of the element.
 * @param validator A function that validates the element.
 * @param timeout The maximum time in milliseconds to wait (default: 5s).
 */
export function waitForElement(selector: string, validator: (element: Element) => boolean, timeout = 5000): Promise<Element | null> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el && validator(el)) {
      return resolve(el);
    }

    const observer = new MutationObserver(() => {
      const node = document.querySelector(selector);
      if (node && validator(node)) {
        observer.disconnect();
        resolve(node);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}
