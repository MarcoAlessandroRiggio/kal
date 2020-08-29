import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';

export interface ExerciseProps {
    prefix: string;
    name: string;
    downstream: Array<lambda.Function>;
    upStream: Array<lambda.Function>
}

export class Exercise extends cdk.Construct {
    public readonly table: dynamodb.Table;

    constructor(scope: cdk.Construct, id: string, props: ExerciseProps) {
        super(scope, id);

        this.table = new dynamodb.Table(this, `${props.prefix}_${id}`, {
            tableName: `${props.prefix}_${id}`,
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: "date",
                type: dynamodb.AttributeType.STRING
            }
        });

        if (props.downstream) props.downstream.forEach(reader => this.table.grantReadData(reader));
        if (props.upStream) props.downstream.forEach(writer => this.table.grantWriteData(writer));
    }
}