## Tracing with Zipkin and Kubernetes

### Requirements
- IBM Cloud Developer Tools: do `npm run idt:install` from either the `getter` or `pusher` folders.
- Access to a Kubernetes cluster: either Minikube, Minikube with IBM Cloud Private deployed, or the IBM Container Service are the documented options. Once you have a cluster and you can do `kubectl get pods` and `helm list` without an error, move on to the next steps.

### Choosing a Docker image location

#### Using Bluemix
From any directory:
1. `bluemix login` (optionally using an API key so it's much quicker next time).
2. `bluemix target --cf`.
3. `bluemix cr login`.
4. `bluemix cr namespace-add (anything e.g. the_namespace)`: we'll reference this repository in the Helm chart for the microservice.

`export GETTER_LOCATION=registry.ng.bluemix.net/the_namespace/getter && export PUSHER_LOCATION=registry.ng.bluemix.net/the_namespace/pusher`

the deploy command we'll later use will push our images up.

#### Using IBM Cloud Private's private registry

- Follow the [pushing and pulling images documentation](https://www.ibm.com/support/knowledgecenter/en/SSBS6K_2.1.0/manage_images/using_docker_cli.html).

`export GETTER_LOCATION=mycluster.icp:8500/default/getter && export PUSHER_LOCATION=mycluster.icp:8500/default/pusher`

#### Using Dockerhub
1. Use the script provided to make things easy: `./BuildAndPushDockerhub.sh`, e.g. 
`./BuildAndPushDockerhub.sh getter 0.0.1 youruser`. will build, tag and push the image to the getter repository for the specified user.

Repeat this process for the pusher too.

This does a `docker login`, `docker build -t ...` and a `docker push`.

`export GETTER_LOCATION=your_username/getter && export PUSHER_LOCATION=your_username/pusher`

If you choose this option, you don't need to use `npm run idt:deploy` later - you can install it with helm or kubectl directly.

#### Caveats when pushing images
- IBM Cloud Private cannot pull from the Bluemix Container Registry trivially.
- The Bluemix Container Registry service cannot pull images from the IBM Container Registry trivially.
- Pushing to Docker is easier but you won't get vulnerability scans unless your image is an official one.

## Deploying each microservice
Make sure `kubectl` and `helm` are available and configured to point to your cluster: `helm install` and `kubectl get pods` should not error! Do this at https://console.bluemix.net/containers, click on your cluster by name (create one if you haven't done so already, the free edition is fine) and then click on the "Access" link to retrieve further instructions.

On Bluemix, depending on where your cluster is, you can do `export KUBECONFIG=$HOME/.bluemix/plugins/container-service/clusters/mycluster/kube-config-hou02-mycluster.yml`. This determines where we'll be deploying to.

On IBM Cloud Private you can configure your client by pasting in the kubectl configuration commands you'll get when clicking "Configure Client" from the main dashboard.

- You'll need to follow the instructions for deploying an application (involving getting a ca.crt file on the local environment (your "client") and optionally specifying it is an insecure registry if you are not using a valid https certificate. 
- Instructions can be found [here](https://www.ibm.com/support/knowledgecenter/en/SSBS6K_2.1.0/manage_images/using_docker_cli.html).
- Make sure you can do `docker login mycluster.icp:8500` before attempting the below steps.
- On RHEL, `ExecStart=/usr/bin/dockerd --insecure-registry=mycluster.icp:8500` is in the `/etc/systemd/system/docker.service.d/docker.conf` file. This is to avoid getting 509 untrusted certificate errors when trying to authenticate with the registry to push your images.

### Getter
- Deploy with `npm run idt:deploy -- --target container --chart-path=chart/getter --deploy-image-target=$GETTER_LOCATION`

### Pusher
- Deploy with `npm run idt:deploy -- --target container --chart-path=chart/pusher --deploy-image-target=$PUSHER_LOCATION`

### Accessing our microservices
#### Figuring out the IP address for Bluemix
`bx cs workers mycluster` will give us the public IP address of our worker node(s): where an application will be running.
```
ID                                                 Public IP        Private IP     Machine Type   State    Status   Version   
kube-hou02-pa3d3a673411b142279fab3599b9a3e19c-w1   173.193.85.184   10.47.122.75   free           normal   Ready    1.7.4_1503*   
```
#### Figuring out the IP address for IBM Cloud Private
Use the "Network Access" or "Services" view in IBM Cloud Private to find the deployed service information. Look for the hyperlinked "Node port" reference: clicking this will show our deployed application in your browser.

## Deploying Zipkin
We're going to be leveraging the Microservice Builder Fabric which provides Zipkin.

### Zipkin on Bluemix
- Again make sure your client is configured so you can do `helm list` andget pods` without errors.
- `helm repo add ibm-charts https://raw.githubusercontent.com/IBM/charts/master/repo/stable`
- `helm install --name fabric ibm-charts/ibm-microservicebuilder-fabric`
- By default this will NOT be exposed externally: the Kubernetes service is of type "ClusterIP".
- `kubectl get services` will show the port information for the deployed service.
- Decide how and proceed to expose or port-forward the Zipkin server.
- We will discover the service using the Kubernetes provided environment variables for the service: we can see them with `kubectl get pods` to get the pod name for Zipkin, then `kubectl exec -it *the pod name from above* printenv | grep SERVICE`.

Option 1: *ClusterIP*. Only applications within the cluster can access this endpoint.
Use `kubectl port-forward` to access the Zipkin server.

`export POD_NAME=$(kubectl get pods --namespace default -l "app=fabric-zipkin" -o jsonpath="{.items[0].metadata.name}")`

`kubectl port-forward $POD_NAME 9411:9411` then access the Zipkin server at `localhost:9411` in your web browser.

Option 2: *NodePort*. Anything can see this, assuming it's a public IP address. Expose it with the following command - be aware that this WILL BE AVAILABLE TO ANYBODY! Public IP address used - no authentication for sending data to it!

`kubectl edit svc/zipkin`, change the service type to *NodePort* instead of *ClusterIP*. On saving the file the change will be made for us.

- Now visit the Zipkin server in your browser at your Kubernetes worker node's public IP address and the NodePort.
- `bx cs workers mycluster` tells us the public IP address of a worker node.
- `kubectl get services | grep zipkin`: use the second port listed (above 30,000).
- Combine the public IP address and the NodePort to get the publically available endpoint.

### Zipkin on IBM Cloud Private
- Use the Catalog/App Center and search for "Microservice Builder Fabric".
- Install the fabric, specifying the elasticsearch host's IP address when prompted for the master IP. Retrieve this by checking the list of deployments you get with IBM Cloud Private.
- Choose a name for the release, review and accept the terms and optionally choose something other than the default namespace.
- Decide how and proceed to expose or port-forward the Zipkin server.

Option 1: *ClusterIP*. only applications within the cluster can access this endpoint, you'll have to use `kubectl port-forward` to view the traces.

Option 2: *NodePort*. anything that can access your IBM Cloud Private instance can see this. 

Select the desired service type when deploying the fabric using the form provided on the IBM Cloud Private web UI.

### Have Zipkin and the application's deployed? Let's try it out.

Note that you should make sure USE_ZIPKIN is being set: if not at the package.json level for getter/setter, definitely in the Dockerfile as this is how we can set environment variables for containerised applications.

#### Trying the example on Bluemix
- From any directory, do `kubectl get services` to determine your endpoints. Remember it's the NodePort value we'll be looing for.
- `bx cs workers mycluster`
- In your web browser, access the `<public IP address:the NodePort value>` to view the pusher. Fill in the textfield with a number and click the button to send some data to the getter. A string is generated of that length which is then sent to the getter service and changed to be lowercase.
- In your web browser, access the Zipkin server at `localhost:9411` (assumes we have set up the port forwarding).
- Adjust the Zipkin web UI so spans will show for your testing, then click "Find traces".

#### Trying the example on IBM Cloud Private
- In your web browser, from the IBM Cloud Private UI under "Network Access" or "Services", access the pusher's endpoint.
- In your web browser, access the Zipkin endpoint in the same manner.

#### Sanity checks

Here's what to check should something go wrong.

Use `bx cr images` to show the images you've pushed to the Container Registry service on Bluemix.

```
REPOSITORY                                     NAMESPACE       TAG     DIGEST         CREATED         SIZE     VULNERABILITY STATUS   
registry.ng.bluemix.net/the_namespace/getter   the_namespace   0.0.1   8bc174e4a708   7 minutes ago   256 MB   Safe   
registry.ng.bluemix.net/the_namespace/pusher   the_namespace   0.0.1   7458346afef6   3 minutes ago   256 MB   Safe  
```
#### Viewing deployed application information
Run `kubectl get deployments`.
```
NAME                DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
getter-deployment   1         1         1            1           8m
pusher-deployment   1         1         1            1           3m
zipkin-zipkin       1         1         1            1           20d
```
This shows the two applications we'll be tracing and the Zipkin server.

#### Viewing deployed service information
Run `kubectl get services`.
```
NAME         CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
getter       172.21.64.21    <nodes>       3001:32735/TCP   12m
kubernetes   172.21.0.1      <none>        443/TCP          31d
pusher       172.21.42.221   <nodes>       3000:31932/TCP   7m
zipkin       172.21.28.81    <none>        9411/TCP         20d
```
This shows the TCP port each application uses (the first port number) and, if exposed as type NodePort, the publically available endpoint.

#### Cleaning up
If you've used helm: `helm delete --purge fabric`, `helm delete --purge getter`, `helm delete --purge setter` will kill and remove the information for your deployments (the images the chart references will still remain).
