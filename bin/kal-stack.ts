import * as cdk from '@aws-cdk/core';

import {Exercise} from "./Exercise";
import {SimpleTable} from "./SimpleTable";
import {ToBeProcessed} from "./ToBeProcessed";
import {TestUploader} from "./TestUploader";

export class KalStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const prefix = "dev";

    const testUploader = new TestUploader(this, "testUploader", {
      prefix: prefix,
      name: "testsUploader"
    });

    let players = new SimpleTable(this, "tableOfPlayers", {
      prefix: prefix, name: "Players",
      downstream: [testUploader.function]
    });

    let testsDefinition = new SimpleTable(this, "tableOfTestsDefinition", {
      prefix: prefix, name: "TestsDefinitions",
      downstream: [testUploader.function]
    });

    let tests = new Exercise(this, "tableOfTests", {
      prefix: prefix, name: "Tests", downstream: [], upStream: [testUploader.function]
    });

    const toBeProcessed = new ToBeProcessed(this, "toBeProcessed", {
      prefix: prefix,
      downstream: [],
      upStream: [],
      listener: [testUploader.function]
    });

    testUploader.function.addEnvironment("BUCKET", toBeProcessed.bucket.bucketName);
    testUploader.function.addEnvironment("USERS_TABLE", players.table.tableName);
    testUploader.function.addEnvironment("TESTS_DEFINITION_TABLE", testsDefinition.table.tableName);
    testUploader.function.addEnvironment("TESTS_TABLE", tests.table.tableName);

  }
}
const app = new cdk.App();
new KalStack(app, 'KalStack');