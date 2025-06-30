import app from "../../..";
import { getVersion } from "../../../utils/handling/getVersion";
import jwt from "jsonwebtoken";

export let bucket: any;

export default function () {
  app.get(
    "/fortnite/api/game/v2/matchmakingservice/ticket/player/:accountId",
    async (c) => {
      const ver = await getVersion(c);
      const query = await c.req.query();
      const bucketId = query.bucketId;
      const split = bucketId?.split(":");
      const region = split?.[2];
      const playlist = split?.[3];

      bucket = bucketId;

      let matchmakingData = jwt.sign(
        {
          accountId: c.req.param("accountId"),
          region: region,
          playlist: playlist,
          bucket: bucketId,
          version: ver.cl,
        },
        ""
      );

      const data = matchmakingData.split(".");

      return c.json({
        serviceUrl: `ws://${process.env.MMIP}${process.env.MMPORT}`,
        ticketType: "mms-player",
        payload: data[0] + "." + data[1],
        signature: data[2],
      });
    }
  );
}
