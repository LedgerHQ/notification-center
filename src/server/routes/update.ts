import { Payload } from '@/src/types';
import { updateUser } from '@/src/database';

const update = async (payload: Payload.UpdateUser) => {
  await updateUser(payload);
};

export default update;
