import { MESSAGE_TYPE } from "../../constants/header.js";
import { serialize } from "../serialize/serialize.js";

export const createServerInfoNotification = (params, sequence) => {
  const type = MESSAGE_TYPE.SERVER_INFO_NOTIFICATION;
  /*
    string name = 1;
    int32 number = 2;
    string host = 3;
    string port = 4;
    repeated int32 types = 5;
  */
  const payload = { params };
  console.log(" [ createServerInfoNotification ] payload ===>> ", payload);
  return serialize(type, payload, sequence);
};
