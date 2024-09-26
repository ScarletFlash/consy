import { Core as ConsyCore } from 'consy';

new ConsyCore('consy')
  .addCommand({
    name: 'rotateForwards',
    description: 'Rotate the page content forwards.',
    callback: () => {
      console.log('Rotating forwards.');
    }
  })
  .addCommand({
    name: 'rotateBackwards',
    description: 'Rotate the page content backwards.',
    callback: () => {
      console.log('Rotating backwards.');
    }
  })
  .mount();
