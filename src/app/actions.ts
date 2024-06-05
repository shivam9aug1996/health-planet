"use server";

import { cookies } from "next/headers";

export const getCookies = () => {
  let token = cookies().get("gym_app_user_token")?.value;
  let userData = cookies().get("gym_app_user_data")?.value;
  return { token, userData };
};

export const deleteCookies = () => {
  cookies()
    .getAll()
    .map((item) => {
      cookies().delete(item?.name);
    });
};
