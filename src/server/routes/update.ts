import { Payload } from '../../types';
import { updateUser } from '../../database';

const update = async (payload: Payload.UpdateUser) => {
  await updateUser(payload);
};

export default update;
