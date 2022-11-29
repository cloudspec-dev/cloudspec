import { Construct } from 'constructs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as sfnTasks from 'aws-cdk-lib/aws-stepfunctions-tasks'
import { Duration } from 'aws-cdk-lib'

export interface SfnInput {
  repositoryName: string
}

export class CreateECR extends Construct {
  public readonly sfn: sfn.StateMachine;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const createECR = new sfnTasks.CallAwsService(this, 'Create ECR Repo', {
      service: 'ecr',
      action: 'createRepository',
      parameters: {
        RepositoryName: sfn.JsonPath.stringAt('$.repositoryName'),
      },
      iamResources: ['arn:aws:ecr:*:*:repository/*'],
      resultPath: '$.ecr'
    })

    const choice = new sfn.Choice(this, 'Error?')
      .when(sfn.Condition.isPresent('$.ecr.Repository'), new sfn.Succeed(this, 'Success'))
      .otherwise(new sfn.Fail(this, 'Failed'))

    this.sfn = new sfn.StateMachine(this, 'Create Component Repository', {
      definition: createECR.next(choice),
      stateMachineType: sfn.StateMachineType.EXPRESS,
      timeout: Duration.minutes(1),
      tracingEnabled: true,
      logs: {
        destination: new logs.LogGroup(this, 'LogGroup'),
        level: sfn.LogLevel.ALL,
      },
    })
  }
}
