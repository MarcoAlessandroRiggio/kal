#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { KalStack } from '../lib/kal-stack';

const app = new cdk.App();
new KalStack(app, 'KalStack');
