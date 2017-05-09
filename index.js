var AWS = require('aws-sdk');

/**
 * This lambda function expects an environmental variable named
 * INSTANCE_ID_LIST, which is a comma separated list of instance ids -
 * if will then go through them all and start them.
 *
 * While any event COULD trigger this, I originally wrote it to be
 * triggered by the CloudWatch CRON trigger - with the assumption that
 * some big task would then be set to run at startup on the instance
 * that is started, and then shut itself off.
 *
 * I do this because I am cheap.
 *
 * @param event Lambda event (ignored)
 * @param context Lambda context (also ignored)
 */
exports.handler = function(event, context) {

    var instanceIdListString =  process.env.INSTANCE_ID_LIST;
    var instanceIdList=(!!instanceIdListString)?instanceIdListString.split(","):null;
    var region = (!!process.env.REGION)?process.env.REGION:'us-east-1';

    if (!!instanceIdList)
    {
        AWS.config.update({region: region});

        var ec2 = new AWS.EC2();

        console.log('Processing start request');

        var params = {
            DryRun: false,
            InstanceIds: instanceIdList
        };

        ec2.describeInstances(params, function(err, data) {
            if (err)
            {
                context.fail("Failed to describe: "+JSON.stringify(err));
            } // an error occurred
            else
            {
                // TODO: Make this work for more than one
                if (!!data && !!data.Reservations && !!data.Reservations[0] &&
                    !!data.Reservations[0].Instances &&
                    !!data.Reservations[0].Instances[0] &&
                    data.Reservations[0].Instances[0].InstanceId==instanceIdList[0] &&
                    !!data.Reservations[0].Instances[0].State &&
                    !!data.Reservations[0].Instances[0].State.Code )
                {
                    var instanceData = data.Reservations[0].Instances[0];
                    if (instanceData.State.Code===80)
                    {
                        console.log("Starting instance");

                        var startParams = {
                            InstanceIds: [ instanceIdList[0]],
                            DryRun: false
                        };
                        ec2.startInstances(startParams, function(err, data) {
                            if (err)
                            {
                                context.fail("Failed to start: "+JSON.stringify(err));
                            }
                            else {
                                context.succeed("Instance started : "+JSON.stringify(data));
                            }
                        });
                    }
                    else
                    {
                        context.succeed("Doing nothing - instance isn't in a stopped state : "+JSON.stringify(instanceData));
                    }
                }
                else {
                    context.fail("Could not find the requested instance");
                }
            }
        });
    }
    else
    {
        context.succeed("Doing nothing - no instances supplied");
    }

};
