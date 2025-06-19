/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "pmc-mono-repo",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    const router = new sst.aws.Router("PmcRouter", {});
    const honoFunction = new sst.aws.Function("PmcHonoServer", {
      handler: "apps/server/src/index.handler",
      url: {
        router: {
          instance: router,
          path: "/api",
        },
      },
    });
  },
});
