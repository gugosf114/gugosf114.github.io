import { canvas, drawArtwork } from './order-studio-art.mjs';
import { createTemplate } from './order-studio-designs.mjs';
import { progress } from './order-packaging-timeline.mjs';

// Fictional portrait examples. Customer artwork and checkout are independent.
export async function createFilmArtwork() {
  const load = async src => { const img = new Image(); img.src = src; await img.decode(); return img; };
  const [portraits, google] = await Promise.all([
    load('media/film-art/sample-portraits.png'), load('media/film-art/google-g.svg'),
  ]);
  const wish = canvas(1024), family = canvas(1024), baby = canvas(1024), business = canvas(1024);
  drawArtwork(wish, createTemplate('birthday-wish'));
  const half = portraits.width / 2;
  family.getContext('2d').drawImage(portraits, 0, 0, half, portraits.height, 0, 0, 1024, 1024);
  const b = baby.getContext('2d');
  b.drawImage(portraits, half, 0, half, portraits.height, 0, 0, 1024, 1024);
  b.textAlign = 'center'; b.fillStyle = '#753e50';
  b.font = '700 63px "Nunito", Arial'; b.fillText('Suzy turns', 512, 886);
  b.font = '400 92px "Fredoka One", Arial'; b.fillText('ONE', 512, 985);
  const g = business.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0,0,1024,1024);
  g.drawImage(google, 257, 257, 510, 510);
  const hero = canvas(1024), h = hero.getContext('2d');
  const designs = [wish, family, baby, business];
  let lastStage = -1;
  return {
    hero, rows: [wish, baby, business],
    update(t) {
      const stage = t < 2 ? 0 : t < 4 ? 1 : t < 6 ? 2 : 3;
      const fade = stage ? progress(t, stage * 2, stage * 2 + .65) : 1;
      if (stage === lastStage && fade === 1) return false;
      h.globalAlpha = 1; h.drawImage(designs[Math.max(0, stage-1)], 0, 0);
      h.globalAlpha = fade; h.drawImage(designs[stage], 0, 0); h.globalAlpha = 1;
      lastStage = fade === 1 ? stage : -1;
      return true;
    },
  };
}
