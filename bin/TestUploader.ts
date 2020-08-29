import * as cdk from "@aws-cdk/core";
import * as lambda from '@aws-cdk/aws-lambda';

const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1)

export interface TestUploaderProps {
    prefix: string;
    name: string;
}

export class TestUploader extends cdk.Construct {
    public readonly function: lambda.Function;

    constructor(scope: cdk.Construct, id: string, props: TestUploaderProps) {
        super(scope, id);

        this.function = new lambda.Function(this, `${capitalize(props.prefix)}${capitalize(props.name)}`, {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset('lambda/importer/importer.zip'),
            handler: 'importer.handler',
        });

    }

}