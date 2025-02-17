import { createElement } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { RootContent } from './RootContent';

const applicationRootElement: HTMLElement = document.createElement('main');
applicationRootElement.className = 'w-96 dark:bg-gray-900 dark:text-white dark';
document.body.appendChild(applicationRootElement);

const root: Root = createRoot(applicationRootElement);
root.render(createElement(RootContent));
