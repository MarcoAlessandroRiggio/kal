import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Kal from '../lib/kal-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Kal.KalStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
