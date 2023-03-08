import ngrok from 'ngrok';
import nodemon from 'nodemon';
import dotenv from 'dotenv';
dotenv.config();

const start = async () => {
  try {
    // create ngrok tunnel
    const url = await ngrok.connect({
      addr: process.env.PORT,
    });

    // start nodemon with SERVER_URL=
    nodemon({
      script: './src/index.ts',
      exec: `SERVER_URL=${url} ts-node`,
    })
      .on('start', async () => {
        console.log(`--------------------`);
        console.log(`Opening ngrok tunnel : ${url}`);
      })
      .on('quit', () => {
        console.log('Closing ngrok tunnel');
        ngrok.kill().then(() => process.exit(0));
      });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

start();
