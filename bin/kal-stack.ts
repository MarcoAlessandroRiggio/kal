import * as cdk from '@aws-cdk/core';

import {Exercise} from "./Exercise";
import {Players} from "./Players";
import {ToBeProcessed} from "./ToBeProcessed";
import {TestUploader} from "./TestUploader";

export class KalStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const prefix = "dev";

    new Exercise(this, "tableOfTests", {
      prefix: prefix, name: "Tests", downstream: [], upStream: []
    });

    new Players(this, "tableOfPlayers", {
      prefix: prefix, name: "Players"
    });

    const testUploader = new TestUploader(this, "testUploader", {
      prefix: prefix,
      name: "testsUploader"
    });

    const toBeProcessed = new ToBeProcessed(this, "toBeProcessed", {
      prefix: prefix,
      downstream: [],
      upStream: [],
      listener: [testUploader.function]
    });

    testUploader.function.addEnvironment("BUCKET", toBeProcessed.bucket.bucketName);

  }
}
const app = new cdk.App();
new KalStack(app, 'KalStack');