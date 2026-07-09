import type { Preview } from '@storybook/react';
import './preview.css';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      default: 'app',
      values: [{ name: 'app', value: 'rgb(249 250 251)' }],
    },
  },
  // A toolbar toggle to preview every component in light or dark.
  globalTypes: {
    theme: {
      description: 'Theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const dark = context.globals.theme === 'dark';
      document.documentElement.classList.toggle('dark', dark);
      return Story();
    },
  ],
};

export default preview;
