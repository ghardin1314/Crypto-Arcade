import axios from "axios";

export const refreshJwt = (access_token) => {
  return axios
    .post(
      "https://api.crypto-arcade.xyz/auth/token",
      {},
      {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      }
    )
    .then(function (res) {
      if (res.status === 200) {
        return res.data["access_token"];
      }
    })
    .catch(function (err) {
      return false;
    });
};
