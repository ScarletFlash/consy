import { Consy } from 'consy';

const body: HTMLBodyElement | null = document.querySelector('body');
if (body === null) {
  throw new Error('The body element is missing.');
}

const pausedAnimationClassName: string = '[&_[data-type=orbit]]:[animation-play-state:paused]';

new Consy('consy')
  .addCommand({
    name: 'pauseRotation',
    description: 'Pauses the rotation of planet orbits.',
    callback: () => {
      body.classList.add(pausedAnimationClassName);
    }
  })
  .addCommand({
    name: 'continueRotation',
    description: 'Continues the rotation of planet orbits.',
    callback: () => {
      body.classList.remove(pausedAnimationClassName);
    }
  })
  .mount();
