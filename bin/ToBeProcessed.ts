import * as s3 from '@aws-cdk/aws-s3';
import * as lambda from "@aws-cdk/aws-lambda";
import * as cdk from "@aws-cdk/core";
import {S3EventSource} from "@aws-cdk/aws-lambda-event-sources";
import {BlockPublicAccess} from "@aws-cdk/aws-s3";

export interface ToBeProcessedProps {
    prefix: string;
    downstream: Array<lambda.Function>;
    upStream: Array<lambda.Function>;
    listener: Array<lambda.Function>;
}

export class ToBeProcessed extends cdk.Construct {
    public readonly bucket: s3.Bucket;

    constructor(scope: cdk.Construct, id: string, props: ToBeProcessedProps) {
        super(scope, id);

        this.bucket = new s3.Bucket(this, `${props.prefix}_${id}`, {
            bucketName: `${props.prefix}-${id}`.toLowerCase(),
            publicReadAccess: false,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        });

        if (props.downstream) props.downstream.forEach(reader => this.bucket.grantRead(reader));
        if (props.upStream) props.upStream.forEach(writer => this.bucket.grantWrite(writer));

        if (props.listener) props.listener.forEach(listener => {
                listener.addEventSource(new S3EventSource(this.bucket, {
                    events: [s3.EventType.OBJECT_CREATED_PUT],
                    filters: [{prefix: 'tests/'}]
                }));
                this.bucket.grantReadWrite(listener);
            }
        )

    }

}