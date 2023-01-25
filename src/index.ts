import dotenv from 'dotenv';

dotenv.config();

const log = () => {
  const port = process.env.PORT;
  console.log(port);
};

export default log;
