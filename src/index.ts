import dotenv from 'dotenv';

dotenv.config();
console.log(process.env.PORT);

const sum = (x: number, y: number) => {
  return x + y;
};

export default sum;
