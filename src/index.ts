import kleur from 'kleur';
import { puzzle1, puzzle2, puzzle3 } from '~/puzzles';
import { Timer } from '~/util/Timer';

async function start() {
    const timer = new Timer();

    // await puzzle1.run();
    // await puzzle2.run();
    await puzzle3.run();

    console.log(kleur.cyan(`All puzzles ran in ${timer.time}.`));
}

start();
