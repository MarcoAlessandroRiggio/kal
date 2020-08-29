import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export interface ExerciseProps {
    prefix: string;
    name: string;
}

export class Players extends cdk.Construct {
    public readonly table: dynamodb.Table;

    constructor(scope: cdk.Construct, id: string, props: ExerciseProps) {
        super(scope, id);

        this.table = new dynamodb.Table(this, `${props.prefix}_${id}`, {
            tableName: `${props.prefix}_${id}`,
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING
            },
        });
    }
}