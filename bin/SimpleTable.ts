import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from "@aws-cdk/aws-lambda";

export interface ExerciseProps {
    prefix: string;
    name: string;
    downstream: Array<lambda.Function>;
}

export class SimpleTable extends cdk.Construct {
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
        if (props.downstream) props.downstream.forEach(writer => this.table.grantReadData(writer));

    }
}